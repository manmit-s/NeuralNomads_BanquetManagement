import { prisma } from "../lib/prisma.js";
import { ConflictError, NotFoundError } from "../utils/errors.js";
import { generateRefNumber } from "../utils/helpers.js";
import type { PaginationParams } from "../types/index.js";
import { Prisma } from "@prisma/client";

export class BookingService {
    /**
     * ────────────────────────────────────────────────────
     * BOOKING CONFLICT PREVENTION (SELECT … FOR UPDATE)
     * ────────────────────────────────────────────────────
     *
     * Uses a Prisma interactive transaction with raw SQL to acquire
     * row-level locks on the bookings table for the target hall
     * during the requested date range. This prevents race conditions
     * where two concurrent requests could book the same slot.
     *
     * Algorithm:
     * 1. BEGIN TRANSACTION (serializable-safe via row locks)
     * 2. SELECT existing bookings WHERE hall_id = ? AND status != 'CANCELLED'
     *    AND date ranges overlap — with FOR UPDATE to lock matched rows.
     * 3. If any rows returned → ROLLBACK, throw 409 Conflict.
     * 4. If no rows → INSERT new booking → COMMIT.
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
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);

        return prisma.$transaction(async (tx) => {
            // ── Step 1: Lock & check for conflicts ──
            const conflicts = await tx.$queryRaw<{ id: string }[]>`
        SELECT id FROM bookings
        WHERE "hallId" = ${data.hallId}
          AND status != 'CANCELLED'
          AND "startDate" <= ${endDate}
          AND "endDate" >= ${startDate}
        FOR UPDATE
      `;

            if (conflicts.length > 0) {
                throw new ConflictError(
                    `Hall is already booked for the selected dates. Conflicting booking(s): ${conflicts.map((c) => c.id).join(", ")}`
                );
            }

            // ── Step 2: Generate booking number ──
            const count = await tx.booking.count({ where: { branchId: data.branchId } });
            const bookingNumber = generateRefNumber("BK", count + 1);

            // ── Step 3: Create booking ──
            const booking = await tx.booking.create({
                data: {
                    bookingNumber,
                    startDate,
                    endDate,
                    startTime: data.startTime,
                    endTime: data.endTime,
                    guestCount: data.guestCount,
                    totalAmount: data.totalAmount,
                    advanceAmount: data.advanceAmount,
                    balanceAmount: data.totalAmount - data.advanceAmount,
                    hallId: data.hallId,
                    leadId: data.leadId,
                    branchId: data.branchId,
                    createdById: userId,
                    notes: data.notes,
                },
                include: {
                    hall: { select: { id: true, name: true } },
                    lead: { select: { id: true, customerName: true } },
                    branch: { select: { id: true, name: true } },
                },
            });

            return booking;
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
            timeout: 10000,
        });
    }

    static async findAll(branchScope: string | undefined, pagination: PaginationParams, filters?: { status?: string; hallId?: string }) {
        const where: any = {};
        if (branchScope) where.branchId = branchScope;
        if (filters?.status) where.status = filters.status;
        if (filters?.hallId) where.hallId = filters.hallId;

        const [bookings, total] = await Promise.all([
            prisma.booking.findMany({
                where,
                include: {
                    hall: { select: { id: true, name: true } },
                    lead: { select: { id: true, customerName: true, customerPhone: true } },
                    branch: { select: { id: true, name: true } },
                },
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit,
                orderBy: { startDate: pagination.sortOrder || "desc" },
            }),
            prisma.booking.count({ where }),
        ]);

        return { data: bookings, meta: { page: pagination.page, limit: pagination.limit, total, totalPages: Math.ceil(total / pagination.limit) } };
    }

    static async findById(id: string, branchScope?: string) {
        const where: any = { id };
        if (branchScope) where.branchId = branchScope;

        const booking = await prisma.booking.findFirst({
            where,
            include: {
                hall: true,
                lead: true,
                event: true,
                invoice: { include: { payments: true } },
                branch: { select: { id: true, name: true } },
                createdBy: { select: { id: true, name: true } },
            },
        });
        if (!booking) throw new NotFoundError("Booking");
        return booking;
    }

    static async update(id: string, data: any, branchScope?: string) {
        await this.findById(id, branchScope);
        return prisma.booking.update({
            where: { id },
            data,
            include: {
                hall: { select: { id: true, name: true } },
                lead: { select: { id: true, customerName: true } },
            },
        });
    }

    /**
     * Calendar availability — returns booked slots for a hall in a date range.
     */
    static async getAvailability(hallId: string, from: Date, to: Date, branchScope?: string) {
        const where: any = {
            hallId,
            status: { not: "CANCELLED" },
            startDate: { lte: to },
            endDate: { gte: from },
        };
        if (branchScope) where.branchId = branchScope;

        return prisma.booking.findMany({
            where,
            select: {
                id: true,
                bookingNumber: true,
                startDate: true,
                endDate: true,
                startTime: true,
                endTime: true,
                status: true,
                lead: { select: { customerName: true } },
            },
            orderBy: { startDate: "asc" },
        });
    }
}
