import type { Request, Response, NextFunction } from "express";
import { callAIRevenue } from "../services/aiRevenue.service.js";

export const aiRevenueController = async (req: Request, res: Response, _next: NextFunction) => {
    try {
        console.log("Incoming AI request:", JSON.stringify(req.body));

        // Ensure the payload has bookings data for the Python microservice
        const payload = {
            role: req.body.role || "head",
            message: req.body.message || "Analyze performance",
            bookings: req.body.bookings || [
                { branch_id: "1", branch_name: "Main Branch", revenue: 250000, capacity: 500, booked: 350 },
                { branch_id: "2", branch_name: "Downtown", revenue: 180000, capacity: 300, booked: 200 }
            ],
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