import type { Request, Response, NextFunction } from "express";
import { ResourceService } from "../services/resource.service.js";

export class ResourceController {
    /**
     * GET /bookings/:id/resources?force=true
     * Returns existing resources or auto-generates them.
     */
    static async getResources(req: Request, res: Response, next: NextFunction) {
        try {
            const force = req.query.force === "true";
            const resources = await ResourceService.getOrGenerate(
                req.params.id as string,
                req.branchScope,
                force
            );
            res.json({ success: true, data: resources });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /bookings/:id/resources
     * Accepts array of { resourceId, manualQty } to update.
     */
    static async updateResources(req: Request, res: Response, next: NextFunction) {
        try {
            const updates = req.body.resources as { resourceId: string; manualQty: number }[];
            const resources = await ResourceService.updateResources(
                req.params.id as string,
                updates,
                req.branchScope
            );
            res.json({ success: true, data: resources });
        } catch (error) {
            next(error);
        }
    }
}
