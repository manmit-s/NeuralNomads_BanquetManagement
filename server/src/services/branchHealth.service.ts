import axios from "axios";
import { prisma } from "../lib/prisma.js";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

/**
 * Fetches REAL branch and booking data from the database,
 * then forwards it to the Python microservice for health analysis.
 */
import { supabaseAdmin } from "../lib/supabase.js";

export const fetchRealBranchData = async (branchScope?: string) => {
    // Fetch branches with their related halls and non-cancelled bookings using Supabase REST
    let query = supabaseAdmin
        .from('branches')
        .select(`
            id,
            name,
            isActive,
            halls (capacity),
            bookings:bookings (status, totalAmount, guestCount)
        `)
        .eq('isActive', true);

    if (branchScope) {
        query = query.eq('id', branchScope);
    }

    const { data: branches, error } = await query;

    if (error || !branches) {
        console.error("[HealthService] Supabase fetch error:", error);
        return [];
    }

    // Transform into the format the Python microservice expects
    const bookings = branches.map((branch: any) => {
        const validBookings = (branch.bookings || []).filter((b: any) => b.status !== "CANCELLED");

        const totalRevenue = validBookings.reduce(
            (sum: number, b: any) => sum + (b.totalAmount || 0),
            0
        );
        const totalCapacity = (branch.halls || []).reduce(
            (sum: number, h: any) => sum + (h.capacity || 0),
            0
        );
        const totalBooked = validBookings.length;

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
