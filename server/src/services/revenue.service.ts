import { prisma } from "../lib/prisma.js";

/* ── Types ────────────────────────────────────────────────── */

export type InsightType = "OPPORTUNITY" | "RISK" | "INFO";
export type InsightSeverity = "LOW" | "MEDIUM" | "HIGH";

export interface RevenueInsight {
    id: string;
    type: InsightType;
    severity: InsightSeverity;
    title: string;
    description: string;
    recommendation: string;
    projectedImpact: string;
    hallName?: string;
}

export interface HallPerformance {
    hallId: string;
    hallName: string;
    branchName: string;
    capacity: number;
    pricePerEvent: number;
    confirmedNext30: number;
    maxSlots: number;
    occupancyPct: number;
    revenueThisMonth: number;
    revenuePrevMonth: number;
    revenueTrend: "UP" | "DOWN" | "FLAT";
    status: "High Demand" | "Stable" | "Low Demand";
}

export interface SimulationResult {
    currentMonthlyRevenue: number;
    projectedRevenue: number;
    revenueDifference: number;
    estimatedBookingChange: number;
    explanation: string;
}

/* ── Service ──────────────────────────────────────────────── */

export class RevenueService {
    /* ───── 1. analyzeRevenuePerformance ───── */
    static async analyzeRevenuePerformance(
        branchScope?: string,
    ): Promise<HallPerformance[]> {
        const now = new Date();
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        const next30 = new Date(now.getTime() + 30 * 86_400_000);

        // Max booking slots per hall in 30 days = 30 (one event per day)
        const MAX_SLOTS_30_DAYS = 30;

        const branchFilter = branchScope ? { branchId: branchScope } : {};

        const halls = await prisma.hall.findMany({
            where: { isActive: true, ...branchFilter },
            include: { branch: { select: { name: true } } },
        });

        const results: HallPerformance[] = [];

        for (const hall of halls) {
            // Confirmed bookings for this hall in next 30 days
            const confirmedNext30 = await prisma.booking.count({
                where: {
                    hallId: hall.id,
                    status: { in: ["CONFIRMED", "LIVE"] },
                    startDate: { gte: now, lte: next30 },
                },
            });

            // Revenue this month
            const thisMonthBookings = await prisma.booking.findMany({
                where: {
                    hallId: hall.id,
                    status: { notIn: ["CANCELLED"] },
                    startDate: { gte: startOfThisMonth, lte: now },
                },
                select: { totalAmount: true },
            });
            const revenueThisMonth = thisMonthBookings.reduce((s, b) => s + b.totalAmount, 0);

            // Revenue previous month
            const prevMonthBookings = await prisma.booking.findMany({
                where: {
                    hallId: hall.id,
                    status: { notIn: ["CANCELLED"] },
                    startDate: { gte: startOfPrevMonth, lte: endOfPrevMonth },
                },
                select: { totalAmount: true },
            });
            const revenuePrevMonth = prevMonthBookings.reduce((s, b) => s + b.totalAmount, 0);

            const occupancyPct = Math.round((confirmedNext30 / MAX_SLOTS_30_DAYS) * 100);
            let status: HallPerformance["status"] = "Stable";
            if (occupancyPct > 75) status = "High Demand";
            else if (occupancyPct < 40) status = "Low Demand";

            let revenueTrend: HallPerformance["revenueTrend"] = "FLAT";
            if (revenuePrevMonth > 0) {
                const change = ((revenueThisMonth - revenuePrevMonth) / revenuePrevMonth) * 100;
                if (change > 5) revenueTrend = "UP";
                else if (change < -5) revenueTrend = "DOWN";
            }

            results.push({
                hallId: hall.id,
                hallName: hall.name,
                branchName: hall.branch.name,
                capacity: hall.capacity,
                pricePerEvent: hall.pricePerEvent,
                confirmedNext30,
                maxSlots: MAX_SLOTS_30_DAYS,
                occupancyPct,
                revenueThisMonth,
                revenuePrevMonth,
                revenueTrend,
                status,
            });
        }

        return results;
    }

    /* ───── 2. generateRevenueInsights ───── */
    static async generateRevenueInsights(
        branchScope?: string,
    ): Promise<RevenueInsight[]> {
        const now = new Date();
        const insights: RevenueInsight[] = [];
        let id = 0;
        const nextId = () => `insight-${++id}`;

        const hallPerf = await this.analyzeRevenuePerformance(branchScope);

        /* ── Per-hall demand insights ── */
        for (const h of hallPerf) {
            if (h.status === "High Demand") {
                // Suggest price increase (5–8%)
                const suggestPct = h.occupancyPct > 85 ? 8 : 5;
                const projected = Math.round(h.revenueThisMonth * (suggestPct / 100));
                insights.push({
                    id: nextId(),
                    type: "OPPORTUNITY",
                    severity: h.occupancyPct > 85 ? "HIGH" : "MEDIUM",
                    title: `${h.hallName} – High Demand`,
                    description: `${h.occupancyPct}% of next month's slots are booked. Demand is strong.`,
                    recommendation: `Consider a ${suggestPct}% price increase to maximise revenue.`,
                    projectedImpact: `Potential additional revenue: ₹${formatLakh(projected)}`,
                    hallName: h.hallName,
                });
            } else if (h.status === "Low Demand") {
                // Suggest discount (3–6%)
                const suggestPct = h.occupancyPct < 20 ? 6 : 3;
                const avgBookingValue = h.pricePerEvent;
                const potentialExtra = Math.round(avgBookingValue * 2 * (1 - suggestPct / 100));
                insights.push({
                    id: nextId(),
                    type: "RISK",
                    severity: h.occupancyPct < 20 ? "HIGH" : "MEDIUM",
                    title: `${h.hallName} Underperforming`,
                    description: `Only ${h.occupancyPct}% of next month's slots are booked.`,
                    recommendation: `Offer a ${suggestPct}% promotional discount to attract bookings.`,
                    projectedImpact: `Potential additional revenue: ₹${formatLakh(potentialExtra)}`,
                    hallName: h.hallName,
                });
            }
        }

        /* ── Revenue Trend: current vs previous month (aggregate) ── */
        const totalThisMonth = hallPerf.reduce((s, h) => s + h.revenueThisMonth, 0);
        const totalPrevMonth = hallPerf.reduce((s, h) => s + h.revenuePrevMonth, 0);
        if (totalPrevMonth > 0) {
            const revChange = ((totalThisMonth - totalPrevMonth) / totalPrevMonth) * 100;
            if (revChange < -10) {
                insights.push({
                    id: nextId(),
                    type: "RISK",
                    severity: revChange < -20 ? "HIGH" : "MEDIUM",
                    title: "Revenue Decline Detected",
                    description: `Current month revenue is down ${Math.abs(Math.round(revChange))}% compared to last month.`,
                    recommendation: "Review pricing strategy and consider targeted promotions.",
                    projectedImpact: `Gap: ₹${formatLakh(Math.abs(totalThisMonth - totalPrevMonth))}`,
                });
            }
        }

        /* ── Booking Velocity ── */
        const branchFilter = branchScope ? { branchId: branchScope } : {};
        const last30 = new Date(now.getTime() - 30 * 86_400_000);
        const prev60 = new Date(now.getTime() - 60 * 86_400_000);

        const velocityRecent = await prisma.booking.count({
            where: { createdAt: { gte: last30 }, ...branchFilter },
        });
        const velocityPrev = await prisma.booking.count({
            where: { createdAt: { gte: prev60, lt: last30 }, ...branchFilter },
        });

        if (velocityPrev > 0) {
            const velocityDrop = ((velocityRecent - velocityPrev) / velocityPrev) * 100;
            if (velocityDrop < -15) {
                insights.push({
                    id: nextId(),
                    type: "RISK",
                    severity: velocityDrop < -30 ? "HIGH" : "MEDIUM",
                    title: "Demand Slowdown",
                    description: `Booking velocity dropped ${Math.abs(Math.round(velocityDrop))}% vs the previous 30-day period (${velocityRecent} vs ${velocityPrev} bookings).`,
                    recommendation: "Increase marketing spend or launch a limited-time offer.",
                    projectedImpact: `${Math.abs(velocityPrev - velocityRecent)} fewer bookings this period`,
                });
            }
        }

        /* ── Weekend Availability ── */
        const next30Date = new Date(now.getTime() + 30 * 86_400_000);
        // Collect weekend dates in next 30 days (Sat=6, Sun=0)
        const weekendDates: Date[] = [];
        const cursor = new Date(now);
        cursor.setHours(0, 0, 0, 0);
        while (cursor <= next30Date) {
            const day = cursor.getDay();
            if (day === 0 || day === 6) {
                weekendDates.push(new Date(cursor));
            }
            cursor.setDate(cursor.getDate() + 1);
        }

        // For each hall, count unbooked weekend slots
        for (const h of hallPerf) {
            // NEVER suggest discount when demand is HIGH
            if (h.status === "High Demand") continue;

            const bookedWeekends = await prisma.booking.count({
                where: {
                    hallId: h.hallId,
                    status: { in: ["CONFIRMED", "LIVE"] },
                    startDate: {
                        in: weekendDates,
                    },
                },
            });
            const unbookedWeekends = weekendDates.length - bookedWeekends;

            if (unbookedWeekends >= 2) {
                insights.push({
                    id: nextId(),
                    type: "OPPORTUNITY",
                    severity: unbookedWeekends > 4 ? "HIGH" : "MEDIUM",
                    title: `Weekend Opportunity – ${h.hallName}`,
                    description: `${unbookedWeekends} weekend slots are open for ${h.hallName} in the next 30 days.`,
                    recommendation: "Launch a weekend promotion or social media campaign.",
                    projectedImpact: `Up to ₹${formatLakh(unbookedWeekends * h.pricePerEvent)} potential revenue`,
                    hallName: h.hallName,
                });
            }
        }

        /* ── If no issues, add positive INFO ── */
        if (insights.length === 0) {
            insights.push({
                id: nextId(),
                type: "INFO",
                severity: "LOW",
                title: "Revenue On Track",
                description: "All halls are performing within normal range. No immediate action needed.",
                recommendation: "Continue monitoring weekly.",
                projectedImpact: "Steady revenue expected",
            });
        }

        return insights;
    }

    /* ───── 3. simulateRevenueChange ───── */
    static async simulateRevenueChange(
        percentageChange: number,
        branchScope?: string,
    ): Promise<SimulationResult> {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const branchFilter = branchScope ? { branchId: branchScope } : {};

        // Current month bookings
        const monthBookings = await prisma.booking.findMany({
            where: {
                status: { notIn: ["CANCELLED"] },
                startDate: { gte: startOfMonth, lte: now },
                ...branchFilter,
            },
            select: { totalAmount: true },
        });

        const currentMonthlyRevenue = monthBookings.reduce((s, b) => s + b.totalAmount, 0);
        const bookingCount = monthBookings.length;

        // Elasticity model:
        // +5% price → −2% volume
        // −5% price → +3% volume
        let volumeChangePct = 0;
        if (percentageChange > 0) {
            volumeChangePct = -(percentageChange / 5) * 2;
        } else if (percentageChange < 0) {
            volumeChangePct = (Math.abs(percentageChange) / 5) * 3;
        }

        const priceMultiplier = 1 + percentageChange / 100;
        const volumeMultiplier = 1 + volumeChangePct / 100;

        const avgBookingPrice = bookingCount > 0 ? currentMonthlyRevenue / bookingCount : 0;
        const newAvgPrice = avgBookingPrice * priceMultiplier;
        const newBookingCount = Math.round(bookingCount * volumeMultiplier);
        const projectedRevenue = Math.round(newAvgPrice * newBookingCount);
        const revenueDifference = projectedRevenue - currentMonthlyRevenue;
        const estimatedBookingChange = newBookingCount - bookingCount;

        // Build explanation
        const direction = percentageChange > 0 ? "Increasing" : "Decreasing";
        const revDir = revenueDifference >= 0 ? "increase" : "decrease";
        const bookDir = estimatedBookingChange >= 0 ? "increase" : "reduce";

        const explanation =
            `${direction} prices by ${Math.abs(percentageChange)}% may ${revDir} revenue by ₹${formatLakh(Math.abs(revenueDifference))} ` +
            `but could ${bookDir} bookings by approx ${Math.abs(Math.round(volumeChangePct))}%.`;

        return {
            currentMonthlyRevenue,
            projectedRevenue,
            revenueDifference,
            estimatedBookingChange,
            explanation,
        };
    }
}

/* ── Helper ── */
function formatLakh(amount: number): string {
    if (amount >= 100_000) return `${(amount / 100_000).toFixed(1)}L`;
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K`;
    return String(amount);
}
