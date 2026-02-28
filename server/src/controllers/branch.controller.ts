import type { Request, Response, NextFunction } from "express";
import { BranchService } from "../services/branch.service.js";

export class BranchController {
    static async getAll(_req: Request, res: Response, next: NextFunction) {
        try {
            const branches = await BranchService.findAll();
            res.json({ success: true, data: branches });
        } catch (error) { next(error); }
    }

    static async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const branch = await BranchService.findById(req.params.id);
            res.json({ success: true, data: branch });
        } catch (error) { next(error); }
    }

    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const branch = await BranchService.create(req.body);
            res.status(201).json({ success: true, data: branch });
        } catch (error) { next(error); }
    }

    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const branch = await BranchService.update(req.params.id, req.body);
            res.json({ success: true, data: branch });
        } catch (error) { next(error); }
    }

    static async deactivate(req: Request, res: Response, next: NextFunction) {
        try {
            await BranchService.deactivate(req.params.id);
            res.json({ success: true, message: "Branch deactivated" });
        } catch (error) { next(error); }
    }
}
