import type { Request, Response, NextFunction } from "express";
import { callAIReviews, callDemoReviews } from "../services/aiReview.service.js";

export const aiReviewController = async (req: Request, res: Response, _next: NextFunction) => {
    try {
        console.log("[ReviewController] Incoming request:", JSON.stringify(req.body));

        const payload = {
            branch_name: req.body.branch_name || "Main Branch",
            review_url: req.body.review_url || "",
        };

        if (!payload.review_url) {
            return res.status(400).json({
                message: "review_url is required"
            });
        }

        const result = await callAIReviews(payload);

        console.log("[ReviewController] Sending response to frontend...");
        return res.status(200).json(result);

    } catch (error: any) {
        console.error("[ReviewController] ERROR:", error.message);

        return res.status(500).json({
            message: "Review intelligence service failed",
            error: error.message
        });
    }
};

export const demoReviewController = async (_req: Request, res: Response, _next: NextFunction) => {
    try {
        console.log("[ReviewController] Demo analysis requested");
        const result = await callDemoReviews();
        return res.status(200).json(result);
    } catch (error: any) {
        console.error("[ReviewController] Demo ERROR:", error.message);
        return res.status(500).json({
            message: "Demo review analysis failed",
            error: error.message
        });
    }
};
