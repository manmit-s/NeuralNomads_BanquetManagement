import type { Request, Response, NextFunction } from "express";
import { HallService } from "../services/hall.service.js";

export class HallController {
    static async getByBranch(req: Request, res: Response, next: NextFunction) {
        try {
            const branchId = req.query.branchId as string;
            const halls = await HallService.findByBranch(branchId);
            res.json({ success: true, data: halls });
        } catch (error) { next(error); }
    }

    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const hall = await HallService.create(req.body);
            res.status(201).json({ success: true, data: hall });
        } catch (error) { next(error); }
    }

    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const hall = await HallService.update(req.params.id as string, req.body);
            res.json({ success: true, data: hall });
        } catch (error) { next(error); }
    }

    static async deactivate(req: Request, res: Response, next: NextFunction) {
        try {
            await HallService.deactivate(req.params.id as string);
            res.json({ success: true, message: "Hall deactivated" });
        } catch (error) { next(error); }
    }
}
