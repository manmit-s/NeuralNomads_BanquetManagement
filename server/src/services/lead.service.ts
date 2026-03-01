import { supabaseAdmin } from "../lib/supabase.js";
import { NotFoundError, AppError } from "../utils/errors.js";
import type { PaginationParams } from "../types/index.js";

export class LeadService {
    static async findAll(
        branchScope: string | undefined,
        pagination: PaginationParams,
        filters?: { status?: string; assignedToId?: string }
    ) {
        let query = supabaseAdmin
            .from("leads")
            .select(
                "*, assignedTo:users!leads_assignedToId_fkey(id, name, email), branch:branches!leads_branchId_fkey(id, name)",
                { count: "exact" }
            );

        if (branchScope) query = query.eq("branchId", branchScope);
        if (filters?.status) query = query.eq("status", filters.status);
        if (filters?.assignedToId) query = query.eq("assignedToId", filters.assignedToId);

        const sortBy = pagination.sortBy || "createdAt";
        const ascending = (pagination.sortOrder || "desc") === "asc";
        query = query.order(sortBy, { ascending });

        const from = (pagination.page - 1) * pagination.limit;
        const to = from + pagination.limit - 1;
        query = query.range(from, to);

        const { data: leads, error, count } = await query;

        if (error) {
            console.error("LeadService.findAll error:", error);
            throw new AppError("Failed to fetch leads", 500);
        }

        const total = count || 0;
        return {
            data: leads || [],
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
            .from("leads")
            .select(
                "*, assignedTo:users!leads_assignedToId_fkey(id, name, email), createdBy:users!leads_createdById_fkey(id, name), branch:branches!leads_branchId_fkey(id, name)"
            )
            .eq("id", id);

        if (branchScope) query = query.eq("branchId", branchScope);

        const { data: lead, error } = await query.single();

        if (error || !lead) throw new NotFoundError("Lead");
        return lead;
    }

    static async create(data: any, userId: string) {
        // Auto-assign to current user if not specified or set to "auto"
        const assignedToId = data.assignedToId && data.assignedToId !== "auto" ? data.assignedToId : userId;

        const { data: lead, error } = await supabaseAdmin
            .from("leads")
            .insert({
                id: crypto.randomUUID(),
                customerName: data.customerName,
                customerPhone: data.customerPhone,
                customerEmail: data.customerEmail || null,
                eventType: data.eventType,
                eventDate: data.eventDate ? new Date(data.eventDate).toISOString() : null,
                guestCount: data.guestCount || null,
                status: "CALL",
                source: data.source || null,
                notes: data.notes || null,
                branchId: data.branchId,
                assignedToId,
                createdById: userId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            })
            .select(
                "*, assignedTo:users!leads_assignedToId_fkey(id, name), branch:branches!leads_branchId_fkey(id, name)"
            )
            .single();

        if (error) {
            console.error("LeadService.create error:", JSON.stringify(error, null, 2));
            throw new AppError(`Failed to create lead: ${error.message}`, 500);
        }

        // Log activity
        await supabaseAdmin.from("lead_activities").insert({
            id: crypto.randomUUID(),
            leadId: lead.id,
            userId,
            action: "Lead created",
            details: `Status: ${lead.status}`,
            createdAt: new Date().toISOString(),
        });

        return lead;
    }

    static async update(id: string, data: any, userId: string, branchScope?: string) {
        // Verify access
        const existing = await this.findById(id, branchScope);

        const updateData: any = { ...data, updatedAt: new Date().toISOString() };
        if (data.eventDate) updateData.eventDate = new Date(data.eventDate).toISOString();

        const { data: updated, error } = await supabaseAdmin
            .from("leads")
            .update(updateData)
            .eq("id", id)
            .select(
                "*, assignedTo:users!leads_assignedToId_fkey(id, name), branch:branches!leads_branchId_fkey(id, name)"
            )
            .single();

        if (error) {
            console.error("LeadService.update error:", JSON.stringify(error, null, 2));
            throw new AppError(`Failed to update lead: ${error.message}`, 500);
        }

        // Log status change
        if (data.status && data.status !== existing.status) {
            await supabaseAdmin.from("lead_activities").insert({
                id: crypto.randomUUID(),
                leadId: id,
                userId,
                action: `Status changed: ${existing.status} → ${data.status}`,
                createdAt: new Date().toISOString(),
            });
        }

        return updated;
    }

    /**
     * Pipeline summary — count leads by status for a branch.
     */
    static async getPipelineSummary(branchScope?: string) {
        let query = supabaseAdmin
            .from("leads")
            .select("status");

        if (branchScope) query = query.eq("branchId", branchScope);

        const { data: leads, error } = await query;

        if (error) {
            console.error("LeadService.getPipelineSummary error:", error);
            throw new AppError("Failed to fetch pipeline summary", 500);
        }

        // Count by status manually
        const counts: Record<string, number> = {};
        for (const lead of leads || []) {
            counts[lead.status] = (counts[lead.status] || 0) + 1;
        }

        return Object.entries(counts).map(([status, count]) => ({ status, count }));
    }
}
