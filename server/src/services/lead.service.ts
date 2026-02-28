import { prisma } from "../lib/prisma.js";
import { NotFoundError } from "../utils/errors.js";
import type { PaginationParams } from "../types/index.js";

export class LeadService {
    static async findAll(branchScope: string | undefined, pagination: PaginationParams, filters?: { status?: string; assignedToId?: string }) {
        const where: any = {};
        if (branchScope) where.branchId = branchScope;
        if (filters?.status) where.status = filters.status;
        if (filters?.assignedToId) where.assignedToId = filters.assignedToId;

        const [leads, total] = await Promise.all([
            prisma.lead.findMany({
                where,
                include: {
                    assignedTo: { select: { id: true, name: true, email: true } },
                    branch: { select: { id: true, name: true } },
                },
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit,
                orderBy: { [pagination.sortBy || "createdAt"]: pagination.sortOrder || "desc" },
            }),
            prisma.lead.count({ where }),
        ]);

        return {
            data: leads,
            meta: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                totalPages: Math.ceil(total / pagination.limit),
            },
        };
    }

    static async findById(id: string, branchScope?: string) {
        const where: any = { id };
        if (branchScope) where.branchId = branchScope;

        const lead = await prisma.lead.findFirst({
            where,
            include: {
                assignedTo: { select: { id: true, name: true, email: true } },
                createdBy: { select: { id: true, name: true } },
                activities: { orderBy: { createdAt: "desc" }, take: 20 },
                booking: true,
                branch: { select: { id: true, name: true } },
            },
        });
        if (!lead) throw new NotFoundError("Lead");
        return lead;
    }

    static async create(data: any, userId: string) {
        const lead = await prisma.lead.create({
            data: {
                ...data,
                eventDate: data.eventDate ? new Date(data.eventDate) : undefined,
                createdById: userId,
            },
            include: {
                assignedTo: { select: { id: true, name: true } },
                branch: { select: { id: true, name: true } },
            },
        });

        // Log activity
        await prisma.leadActivity.create({
            data: {
                leadId: lead.id,
                userId,
                action: "Lead created",
                details: `Status: ${lead.status}`,
            },
        });

        return lead;
    }

    static async update(id: string, data: any, userId: string, branchScope?: string) {
        // Verify access
        const existing = await this.findById(id, branchScope);

        const updated = await prisma.lead.update({
            where: { id },
            data: {
                ...data,
                eventDate: data.eventDate ? new Date(data.eventDate) : undefined,
            },
            include: {
                assignedTo: { select: { id: true, name: true } },
                branch: { select: { id: true, name: true } },
            },
        });

        // Log status change
        if (data.status && data.status !== existing.status) {
            await prisma.leadActivity.create({
                data: {
                    leadId: id,
                    userId,
                    action: `Status changed: ${existing.status} → ${data.status}`,
                },
            });
        }

        return updated;
    }

    /**
     * Pipeline summary — count leads by status for a branch.
     */
    static async getPipelineSummary(branchScope?: string) {
        const where: any = {};
        if (branchScope) where.branchId = branchScope;

        const counts = await prisma.lead.groupBy({
            by: ["status"],
            where,
            _count: { _all: true },
        });

        return counts.map((c: { status: string; _count: { _all: number } }) => ({ status: c.status, count: c._count._all }));
    }
}
