import type { Request, Response, NextFunction } from "express";
import { fetchRealBranchData, callBranchHealth } from "../services/branchHealth.service.js";

export const branchHealthController = async (req: Request, res: Response, _next: NextFunction) => {
    try {
        console.log("[HealthController] Incoming request");

        // Fetch REAL branch data from database
        // branchScope comes from branchIsolation middleware (undefined for OWNER = all branches)
        const branchScope = (req as any).branchScope;
        const bookings = await fetchRealBranchData(branchScope);

        if (bookings.length === 0) {
            return res.status(200).json({
                overall_health_score: 0,
                strongest_branch: "N/A",
                weakest_branch: "N/A",
                branches: [],
                ai_executive_summary: "No branches found in the database. Please add branches first."
            });
        }

        const payload = {
            bookings,
            review_overrides: req.body.review_overrides || {}
        };

        const result = await callBranchHealth(payload);

        console.log("[HealthController] Sending response...");
        return res.status(200).json(result);

    } catch (error: any) {
        console.error("[HealthController] ERROR:", error.message);
        return res.status(500).json({
            message: "Branch health service failed",
            error: error.message
        });
    }
};
