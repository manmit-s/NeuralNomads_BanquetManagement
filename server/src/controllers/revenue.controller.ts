import type { Request, Response, NextFunction } from "express";
import { RevenueService } from "../services/revenue.service.js";

export class RevenueController {
    /** GET /revenue/performance — hall-level utilization + revenue data */
    static async getPerformance(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await RevenueService.analyzeRevenuePerformance(req.branchScope);
            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    /** GET /revenue/insights — generated insights & recommendations */
    static async getInsights(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await RevenueService.generateRevenueInsights(req.branchScope);
            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    /** GET /revenue/simulate?change=5 — revenue simulation */
    static async simulate(req: Request, res: Response, next: NextFunction) {
        try {
            const change = parseFloat(req.query.change as string);
            if (isNaN(change) || change < -10 || change > 15) {
                res.status(400).json({
                    success: false,
                    message: "Parameter 'change' must be a number between -10 and 15",
                });
                return;
            }
            const data = await RevenueService.simulateRevenueChange(change, req.branchScope);
            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }
}
