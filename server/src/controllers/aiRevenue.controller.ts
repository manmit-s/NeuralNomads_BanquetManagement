import type { Request, Response, NextFunction } from "express";
import { callAIRevenue } from "../services/aiRevenue.service.js";
import { prisma } from "../lib/prisma.js";

export const aiRevenueController = async (req: Request, res: Response, _next: NextFunction) => {
    try {
        console.log("Incoming AI request:", JSON.stringify(req.body));

        let branchData = req.body.bookings;

        if (!branchData) {
            const branches = await prisma.branch.findMany({
                include: { halls: true, bookings: true }
            });

            if (branches.length > 0) {
                branchData = branches.map((b: any) => {
                    const totalRevenue = b.bookings.reduce((sum: number, bk: any) => sum + bk.totalAmount, 0);
                    const totalCapacity = b.halls.reduce((sum: number, h: any) => sum + h.capacity, 0) || 500;
                    const bookedEvents = b.bookings.length * 100;

                    // If no real data yet, provide a realistic demo baseline using real branch names
                    const demoRev = Math.floor(Math.random() * 100000) + 50000;
                    const demoBook = Math.floor(totalCapacity * (Math.random() * 0.4 + 0.4));

                    return {
                        branch_id: b.id,
                        branch_name: b.name,
                        revenue: totalRevenue > 0 ? totalRevenue : demoRev,
                        capacity: totalCapacity,
                        booked: bookedEvents > 0 ? bookedEvents : demoBook
                    };
                });
            } else {
                branchData = [
                    { branch_id: "1", branch_name: "Main Branch", revenue: 250000, capacity: 500, booked: 350 },
                    { branch_id: "2", branch_name: "Delhi Branch", revenue: 180000, capacity: 300, booked: 200 },
                    { branch_id: "3", branch_name: "Pune Branch", revenue: 120000, capacity: 250, booked: 180 }
                ];
            }
        }

        // Ensure the payload has bookings data for the Python microservice
        const payload = {
            role: req.body.role || "head",
            message: req.body.message || "Analyze performance",
            bookings: branchData,
            chat_history: req.body.chat_history || []
        };

        const result = await callAIRevenue(payload);

        console.log("Sending response to frontend...");

        return res.status(200).json(result);

    } catch (error: any) {
        console.error("AI CONTROLLER ERROR:", error.message);

        return res.status(500).json({
            message: "AI service failed",
            error: error.message
        });
    }
};