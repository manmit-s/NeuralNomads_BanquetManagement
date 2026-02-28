import type { Request, Response, NextFunction } from "express";
import { ReportService } from "../services/report.service.js";

export class ReportController {
    static async dashboard(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await ReportService.dashboardSummary(req.branchScope);
            res.json({ success: true, data });
        } catch (error) { next(error); }
    }

    static async branchRevenue(req: Request, res: Response, next: NextFunction) {
        try {
            const { from, to } = req.query;
            const data = await ReportService.branchRevenue(
                new Date(from as string),
                new Date(to as string),
                req.branchScope
            );
            res.json({ success: true, data });
        } catch (error) { next(error); }
    }

    static async conversionRate(req: Request, res: Response, next: NextFunction) {
        try {
            const { from, to } = req.query;
            const data = await ReportService.conversionRate(
                new Date(from as string),
                new Date(to as string),
                req.branchScope
            );
            res.json({ success: true, data });
        } catch (error) { next(error); }
    }

    static async occupancyRate(req: Request, res: Response, next: NextFunction) {
        try {
            const { from, to } = req.query;
            const data = await ReportService.occupancyRate(
                new Date(from as string),
                new Date(to as string),
                req.branchScope
            );
            res.json({ success: true, data });
        } catch (error) { next(error); }
    }

    static async outstandingSummary(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await ReportService.outstandingSummary(req.branchScope);
            res.json({ success: true, data });
        } catch (error) { next(error); }
    }
}
