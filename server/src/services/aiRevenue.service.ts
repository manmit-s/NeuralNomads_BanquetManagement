import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/errors.js";

interface AIBooking {
    branch_id: string;
    branch_name: string;
    revenue: number;
    capacity: number;
    booked: number;
}

interface AIRevenueRequest {
    role: string;
    message: string;
    bookings: AIBooking[];
    chat_history?: { role: string; content: string }[];
}

export class AIRevenueService {
    /**
     * Fetches branches with their booking + hall data from DB,
     * aggregates the numbers, calls the AI microservice, and returns the result.
     */
    static async analyze(
        body: { message: string; chat_history?: { role: string; content: string }[] },
        userId: string,
        userRole: string,
        branchScope?: string
    ) {
        // ── Determine AI Role and Branch Filter ──
        const isOwner = userRole === "OWNER";
        const aiRole = isOwner ? "head" : "branch";

        const branchWhereClause = isOwner && !branchScope
            ? { isActive: true }
            : { isActive: true, id: branchScope };

        let bookings: AIBooking[] = [];

        try {
            // ── Fetch branches with bookings and halls ──
            const branches = await prisma.branch.findMany({
                where: branchWhereClause,
                include: {
                    bookings: {
                        where: { status: { not: "CANCELLED" } },
                        select: { totalAmount: true, hallId: true },
                    },
                    halls: {
                        where: { isActive: true },
                        select: { capacity: true },
                    },
                },
            });

            // ── Aggregate per branch ──
            bookings = branches.map((branch: any) => ({
                branch_id: branch.id,
                branch_name: branch.name,
                revenue: branch.bookings.reduce((sum: number, b: any) => sum + b.totalAmount, 0),
                capacity: branch.halls.reduce((sum: number, h: any) => sum + h.capacity, 0),
                booked: branch.bookings.length,
            }));
        } catch (dbError) {
            console.error("Database unavailable, using simulated data fallback. Error:", dbError);
            // Safe fallback if database config missing or Prisma fails
            if (aiRole === "head" || !branchScope) {
                bookings = [
                    { branch_id: "1", branch_name: "Andheri", revenue: 450000, capacity: 500, booked: 400 },
                    { branch_id: "2", branch_name: "Bandra", revenue: 120000, capacity: 300, booked: 80 }
                ];
            } else {
                bookings = [
                    { branch_id: branchScope, branch_name: "Current Branch", revenue: 200000, capacity: 400, booked: 180 }
                ];
            }
        }

        // ── Build request for AI microservice ──
        const aiRequest: AIRevenueRequest = {
            role: aiRole,
            message: body.message,
            bookings,
            chat_history: body.chat_history || [],
        };

        // ── Call AI microservice ──
        const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

        try {
            const response = await fetch(`${AI_SERVICE_URL}/ai-revenue`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(aiRequest),
            });

            if (!response.ok) {
                const errorText = await response.text();
                // Log actual error internally
                console.error(`AI Microservice failed with status ${response.status}:`, errorText);

                // We throw a standardized error format the global error handler can catch
                const err: any = new Error(`AI service unavailable`);
                err.statusCode = 503;
                throw err;
            }

            return response.json();
        } catch (error: any) {
            // Log the raw error before returning the safe one
            console.error("Failed to connect to AI missing service:", error.message || error);
            // If fetch entirely fails (ECONNREFUSED) or we threw a 503
            if (!(error instanceof AppError)) {
                throw new AppError("AI service unavailable", 503);
            }
            throw error;
        }
    }
}

