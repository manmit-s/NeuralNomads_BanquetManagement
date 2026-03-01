import { prisma } from "../lib/prisma.js";
import { Prisma } from "@prisma/client";

export class ReportService {
    /**
     * Branch-wise revenue summary for a date range.
     */
    static async branchRevenue(from: Date, to: Date, branchScope?: string) {
        const branchFilter = branchScope ? Prisma.sql`AND i."branchId" = ${branchScope}` : Prisma.sql``;

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
            halls.map(async (hall: { id: string; name: string; branchId: string }) => {
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

        const totalOutstanding = invoices.reduce((sum: number, inv: { totalAmount: number; paidAmount: number }) => sum + (inv.totalAmount - inv.paidAmount), 0);
        const overdueCount = invoices.filter((i: { status: string }) => i.status === "OVERDUE").length;

        return {
            totalOutstanding,
            invoiceCount: invoices.length,
            overdueCount,
        };
    }

    /**
     * Dashboard summary cards.
     * Revenue & outstanding are derived from bookings (totalAmount / balanceAmount)
     * since invoices may not exist yet for new setups.
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
            monthlyBookingRevenue,
            outstandingBookings,
        ] = await Promise.all([
            prisma.lead.count({ where: { ...where, createdAt: { gte: monthStart } } }),
            prisma.booking.count({ where: { ...where, status: { in: ["TENTATIVE", "CONFIRMED"] } } }),
            prisma.booking.count({
                where: {
                    ...where,
                    startDate: { gte: today },
                    status: { in: ["TENTATIVE", "CONFIRMED"] },
                },
            }),
            // Revenue = sum of totalAmount of CONFIRMED + TENTATIVE bookings created this month
            prisma.booking.aggregate({
                where: {
                    ...where,
                    status: { in: ["CONFIRMED", "TENTATIVE"] },
                    createdAt: { gte: monthStart, lte: monthEnd },
                },
                _sum: { totalAmount: true },
            }),
            // Outstanding = sum of balanceAmount across all active bookings
            prisma.booking.aggregate({
                where: {
                    ...where,
                    status: { in: ["TENTATIVE", "CONFIRMED"] },
                },
                _sum: { balanceAmount: true },
            }),
        ]);

        return {
            totalLeadsThisMonth: totalLeads,
            activeBookings,
            upcomingEvents,
            monthlyRevenue: monthlyBookingRevenue._sum.totalAmount || 0,
            totalOutstanding: outstandingBookings._sum.balanceAmount || 0,
        };
    }

    /**
     * Branch performance — booking-based revenue & count per branch.
     */
    static async branchPerformance(branchScope?: string) {
        const where: any = {
            status: { in: ["TENTATIVE", "CONFIRMED", "COMPLETED"] },
        };
        if (branchScope) where.branchId = branchScope;

        const branches = await prisma.branch.findMany({
            where: { isActive: true, ...(branchScope ? { id: branchScope } : {}) },
            select: { id: true, name: true },
        });

        const results = await Promise.all(
            branches.map(async (branch) => {
                const bookingWhere = { ...where, branchId: branch.id };
                const [revenue, bookingCount] = await Promise.all([
                    prisma.booking.aggregate({
                        where: bookingWhere,
                        _sum: { totalAmount: true },
                    }),
                    prisma.booking.count({ where: bookingWhere }),
                ]);
                return {
                    branchId: branch.id,
                    branchName: branch.name,
                    totalRevenue: revenue._sum.totalAmount || 0,
                    bookingCount,
                    trend: "+0%",
                };
            })
        );

        return results;
    }
}
