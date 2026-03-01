import { supabaseAdmin } from "../lib/supabase.js";
import { ConflictError, NotFoundError, AppError } from "../utils/errors.js";
import { generateRefNumber } from "../utils/helpers.js";
import { TwilioService } from "./twilio.service.js";
import type { PaginationParams } from "../types/index.js";

export class BookingService {
    /**
     * Creates a new booking using the REST API.
     * Checks for date conflicts by querying overlapping bookings.
     */
    static async create(
        data: {
            startDate: string;
            endDate: string;
            startTime: string;
            endTime: string;
            guestCount: number;
            hallId: string;
            leadId: string;
            branchId: string;
            totalAmount: number;
            advanceAmount: number;
            notes?: string;
        },
        userId: string
    ) {
        let startDateValue = data.startDate;
        let endDateValue = data.endDate;

        // Ensure dates are valid strings
        if (startDateValue) {
            startDateValue = new Date(startDateValue).toISOString();
        }

        // If end date is missing (form allows it to be optional now), set it to start date
        if (!endDateValue || endDateValue === "") {
            endDateValue = startDateValue;
        } else {
            endDateValue = new Date(endDateValue).toISOString();
        }

        // ── Step 1: Check for conflicts ──
        // (We can't use SELECT FOR UPDATE via REST, so we just check explicitly)
        const { data: conflicts, error: conflictErr } = await supabaseAdmin
            .from("bookings")
            .select("id")
            .eq("hallId", data.hallId)
            .neq("status", "CANCELLED")
            .lte("startDate", endDateValue)
            .gte("endDate", startDateValue);

        if (conflictErr) {
            console.error("Conflict check error:", conflictErr);
            throw new AppError("Failed to verify hall availability", 500);
        }

        if (conflicts && conflicts.length > 0) {
            throw new ConflictError(
                `Hall is already booked for the selected dates. Conflicting booking(s): ${conflicts.map((c) => c.id).join(", ")}`
            );
        }

        // ── Step 2: Generate booking number ──
        const { count, error: countErr } = await supabaseAdmin
            .from("bookings")
            .select("*", { count: "exact", head: true })
            .eq("branchId", data.branchId);

        if (countErr) {
            console.error("Count error:", countErr);
            throw new AppError("Failed to generate booking number", 500);
        }

        const totalCount = count || 0;
        const bookingNumber = generateRefNumber("BK", totalCount + 1);

        // ── Step 3: Create booking ──
        const { data: booking, error: insertErr } = await supabaseAdmin
            .from("bookings")
            .insert({
                id: crypto.randomUUID(),
                bookingNumber,
                startDate: startDateValue,
                endDate: endDateValue,
                startTime: data.startTime,
                endTime: data.endTime,
                guestCount: data.guestCount || 0,
                status: "TENTATIVE",
                totalAmount: data.totalAmount,
                advanceAmount: data.advanceAmount || 0,
                balanceAmount: data.totalAmount - (data.advanceAmount || 0),
                notes: data.notes || null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                branchId: data.branchId,
                hallId: data.hallId,
                leadId: data.leadId,
                createdById: userId,
            })
            .select(
                "*, hall:halls!bookings_hallId_fkey(id, name), lead:leads!bookings_leadId_fkey(id, customerName), branch:branches!bookings_branchId_fkey(id, name)"
            )
            .single();

        if (insertErr) {
            console.error("Booking creation error:", insertErr);
            throw new AppError(`Failed to create booking: ${insertErr.message}`, 500);
        }

        // Auto-update lead status to CONFIRMED/ADVANCE when a booking is made
        await supabaseAdmin
            .from("leads")
            .update({ status: "ADVANCE", updatedAt: new Date().toISOString() })
            .eq("id", data.leadId);

        // Fetch lead and hall details to send SMS notification
        const bookingWithDetails = await this.findById(booking.id);
        const { data: lead } = await supabaseAdmin.from("leads").select("*").eq("id", data.leadId).single();

        if (lead) {
            await TwilioService.sendBookingNotification(bookingWithDetails, lead);
        }

        return booking;
    }

    static async findAll(branchScope: string | undefined, pagination: PaginationParams, filters?: { status?: string; hallId?: string }) {
        let query = supabaseAdmin
            .from("bookings")
            .select(
                "*, hall:halls!bookings_hallId_fkey(id, name), lead:leads!bookings_leadId_fkey(id, customerName, customerPhone), branch:branches!bookings_branchId_fkey(id, name)",
                { count: "exact" }
            );

        if (branchScope) query = query.eq("branchId", branchScope);
        if (filters?.status) query = query.eq("status", filters.status);
        if (filters?.hallId) query = query.eq("hallId", filters.hallId);

        const sortBy = pagination.sortBy || "startDate";
        const ascending = (pagination.sortOrder || "desc") === "asc";
        query = query.order(sortBy, { ascending });

        const from = (pagination.page - 1) * pagination.limit;
        const to = from + pagination.limit - 1;
        query = query.range(from, to);

        const { data: bookings, error, count } = await query;

        if (error) {
            console.error("BookingService.findAll error:", error);
            throw new AppError("Failed to fetch bookings", 500);
        }

        const total = count || 0;
        return {
            data: bookings || [],
            meta: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                totalPages: Math.ceil(total / pagination.limit),
            },
        };
    }

    static async findById(id: string, branchScope?: string) {
        let query = supabaseAdmin
            .from("bookings")
            .select(
                "*, hall:halls!bookings_hallId_fkey(*), lead:leads!bookings_leadId_fkey(*), events!events_bookingId_fkey(*), invoices!invoices_bookingId_fkey(*, payments!payments_invoiceId_fkey(*)), branch:branches!bookings_branchId_fkey(id, name), createdBy:users!bookings_createdById_fkey(id, name)"
            )
            .eq("id", id);

        if (branchScope) query = query.eq("branchId", branchScope);

        const { data: booking, error } = await query.single();

        if (error || !booking) {
            console.error("Booking info error:", error);
            throw new NotFoundError("Booking");
        }

        // Supabase returns related lists slightly differently than Prisma. 
        // In Prisma `invoice` is a 1:1, but here it might return an array if modeled as many-to-one,
        // so we normalize it to match the frontend expectations.
        const normalized = {
            ...booking,
            event: booking.events && booking.events.length > 0 ? booking.events[0] : null,
            invoice: booking.invoices && booking.invoices.length > 0 ? booking.invoices[0] : null,
        };

        delete normalized.events;
        delete normalized.invoices;

        return normalized;
    }

    static async update(id: string, data: any, branchScope?: string) {
        // Verify existence
        await this.findById(id, branchScope);

        const updateData: any = { ...data, updatedAt: new Date().toISOString() };

        const { data: updated, error } = await supabaseAdmin
            .from("bookings")
            .update(updateData)
            .eq("id", id)
            .select("*, hall:halls!bookings_hallId_fkey(id, name), lead:leads!bookings_leadId_fkey(id, customerName)")
            .single();

        if (error) {
            console.error("Booking update error:", error);
            throw new AppError("Failed to update booking", 500);
        }

        return updated;
    }

    /**
     * Calendar availability — returns booked slots for a hall in a date range.
     */
    static async getAvailability(hallId: string, from: Date, to: Date, branchScope?: string) {
        let query = supabaseAdmin
            .from("bookings")
            .select("id, bookingNumber, startDate, endDate, startTime, endTime, status, lead:leads!bookings_leadId_fkey(customerName)")
            .eq("hallId", hallId)
            .neq("status", "CANCELLED")
            .lte("startDate", to.toISOString())
            .gte("endDate", from.toISOString())
            .order("startDate", { ascending: true });

        if (branchScope) query = query.eq("branchId", branchScope);

        const { data: bookings, error } = await query;

        if (error) {
            console.error("Availability error:", error);
            throw new AppError("Failed to fetch availability", 500);
        }

        return bookings || [];
    }
}
