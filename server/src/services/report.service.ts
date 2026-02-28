import { prisma } from "../lib/prisma.js";
import { Prisma } from "@prisma/client";

export class ReportService {
    /**
     * Branch-wise revenue summary for a date range.
     */
    static async branchRevenue(from: Date, to: Date, branchScope?: string) {
        const branchFilter = branchScope ? Prisma.sql`AND i."branchId" = ${branchScope}` : Prisma.empty;

        return prisma.$queryRaw`
      SELECT
        b.id AS "branchId",
        b.name AS "branchName",
        COALESCE(SUM(i."paidAmount"), 0)::float AS "totalRevenue",
        COUNT(i.id)::int AS "invoiceCount"
      FROM branches b
      LEFT JOIN invoices i ON i."branchId" = b.id
        AND i."createdAt" >= ${from}
        AND i."createdAt" <= ${to}
        ${branchFilter}
      WHERE b."isActive" = true
      GROUP BY b.id, b.name
      ORDER BY "totalRevenue" DESC
    `;
    }

    /**
     * Lead conversion rate (leads that reached CONFIRMED booking / total leads).
     */
    static async conversionRate(from: Date, to: Date, branchScope?: string) {
        const where: any = { createdAt: { gte: from, lte: to } };
        if (branchScope) where.branchId = branchScope;

        const [total, converted] = await Promise.all([
            prisma.lead.count({ where }),
            prisma.lead.count({
                where: {
                    ...where,
                    status: { in: ["ADVANCE", "MENU_FINALIZATION", "DECORATION", "FULL_PAYMENT", "SETTLEMENT", "FEEDBACK"] },
                },
            }),
        ]);

        return {
            total,
            converted,
            conversionRate: total > 0 ? Math.round((converted / total) * 10000) / 100 : 0, // e.g. 42.86%
        };
    }

    /**
     * Hall occupancy rate for a date range.
     */
    static async occupancyRate(from: Date, to: Date, branchScope?: string) {
        const where: any = {};
        if (branchScope) where.branchId = branchScope;

        const halls = await prisma.hall.findMany({
            where: { ...where, isActive: true },
            select: { id: true, name: true, branchId: true },
        });

        const totalDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        const results = await Promise.all(
            halls.map(async (hall) => {
                const bookedDays = await prisma.booking.count({
                    where: {
                        hallId: hall.id,
                        status: { not: "CANCELLED" },
                        startDate: { lte: to },
                        endDate: { gte: from },
                    },
                });

                return {
                    hallId: hall.id,
                    hallName: hall.name,
                    bookedDays,
                    totalDays,
                    occupancyRate: Math.round((bookedDays / totalDays) * 10000) / 100,
                };
            })
        );

        return results;
    }

    /**
     * Outstanding payment summary.
     */
    static async outstandingSummary(branchScope?: string) {
        const where: any = {
            status: { in: ["SENT", "PARTIALLY_PAID", "OVERDUE"] },
        };
        if (branchScope) where.branchId = branchScope;

        const invoices = await prisma.invoice.findMany({
            where,
            select: { totalAmount: true, paidAmount: true, status: true, branchId: true },
        });

        const totalOutstanding = invoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);
        const overdueCount = invoices.filter((i) => i.status === "OVERDUE").length;

        return {
            totalOutstanding,
            invoiceCount: invoices.length,
            overdueCount,
        };
    }

    /**
     * Dashboard summary cards.
     */
    static async dashboardSummary(branchScope?: string) {
        const where: any = {};
        if (branchScope) where.branchId = branchScope;

        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const [
            totalLeads,
            activeBookings,
            upcomingEvents,
            monthlyRevenue,
            outstanding,
        ] = await Promise.all([
            prisma.lead.count({ where: { ...where, createdAt: { gte: monthStart } } }),
            prisma.booking.count({ where: { ...where, status: { in: ["TENTATIVE", "CONFIRMED"] } } }),
            prisma.event.count({ where: { ...where, eventDate: { gte: today }, status: "UPCOMING" } }),
            prisma.invoice.aggregate({
                where: { ...where, createdAt: { gte: monthStart, lte: monthEnd } },
                _sum: { paidAmount: true },
            }),
            prisma.invoice.aggregate({
                where: { ...where, status: { in: ["SENT", "PARTIALLY_PAID", "OVERDUE"] } },
                _sum: { totalAmount: true, paidAmount: true },
            }),
        ]);

        return {
            totalLeadsThisMonth: totalLeads,
            activeBookings,
            upcomingEvents,
            monthlyRevenue: monthlyRevenue._sum.paidAmount || 0,
            totalOutstanding: (outstanding._sum.totalAmount || 0) - (outstanding._sum.paidAmount || 0),
        };
    }
}
