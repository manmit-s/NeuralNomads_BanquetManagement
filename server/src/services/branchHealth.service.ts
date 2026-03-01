import axios from "axios";
import { prisma } from "../lib/prisma.js";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

/**
 * Fetches REAL branch and booking data from the database,
 * then forwards it to the Python microservice for health analysis.
 */
export const fetchRealBranchData = async (branchScope?: string) => {
    // 1. Get all active branches (or scoped to one branch)
    const where: any = { isActive: true };
    if (branchScope) where.id = branchScope;

    const branches = await prisma.branch.findMany({
        where,
        select: {
            id: true,
            name: true,
            halls: { select: { capacity: true } },
            bookings: {
                where: { status: { not: "CANCELLED" } },
                select: { totalAmount: true, guestCount: true },
            },
        },
    });

    // 2. Transform into the format the Python microservice expects
    const bookings = branches.map((branch) => {
        const totalRevenue = branch.bookings.reduce(
            (sum: number, b: { totalAmount: number }) => sum + b.totalAmount,
            0
        );
        const totalCapacity = branch.halls.reduce(
            (sum: number, h: { capacity: number }) => sum + h.capacity,
            0
        );
        const totalBooked = branch.bookings.length;

        return {
            branch_id: branch.id,
            branch_name: branch.name,
            revenue: totalRevenue,
            capacity: totalCapacity || 100, // fallback if no halls yet
            booked: totalBooked,
        };
    });

    return bookings;
};

export const callBranchHealth = async (payload: any) => {
    console.log("[HealthService] Forwarding to Python:", JSON.stringify(payload).slice(0, 200));

    const response = await axios.post(
        `${AI_SERVICE_URL}/ai-branch-health`,
        payload,
        { timeout: 90000 }
    );

    console.log("[HealthService] Response received:", response.status);
    return response.data;
};
