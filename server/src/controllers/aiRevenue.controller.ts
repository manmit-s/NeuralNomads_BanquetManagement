import type { Request, Response, NextFunction } from "express";
import { AIRevenueService } from "../services/aiRevenue.service.js";

export class AIRevenueController {
    static async analyze(req: Request, res: Response, next: NextFunction) {
        try {
            const { message, chat_history } = req.body;

            if (!message && !chat_history?.length) {
                return res.status(400).json({ success: false, error: "message is required" });
            }

            // req.user is guaranteed by authentication middleware
            // req.branchScope is provided by branchIsolation middleware
            const result = await AIRevenueService.analyze(
                { message: message || "Analyze performance", chat_history },
                req.user!.id,
                req.user!.role,
                req.branchScope
            );

            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}
