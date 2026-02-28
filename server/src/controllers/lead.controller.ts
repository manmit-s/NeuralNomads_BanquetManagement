import type { Request, Response, NextFunction } from "express";
import { LeadService } from "../services/lead.service.js";
import { parsePagination } from "../utils/helpers.js";

export class LeadController {
    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const pagination = parsePagination(req.query as Record<string, unknown>);
            const filters = {
                status: req.query.status as string | undefined,
                assignedToId: req.query.assignedToId as string | undefined,
            };
            const result = await LeadService.findAll(req.branchScope, pagination, filters);
            res.json({ success: true, ...result });
        } catch (error) { next(error); }
    }

    static async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const lead = await LeadService.findById(req.params.id, req.branchScope);
            res.json({ success: true, data: lead });
        } catch (error) { next(error); }
    }

    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const lead = await LeadService.create(req.body, req.user!.id);
            res.status(201).json({ success: true, data: lead });
        } catch (error) { next(error); }
    }

    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const lead = await LeadService.update(req.params.id, req.body, req.user!.id, req.branchScope);
            res.json({ success: true, data: lead });
        } catch (error) { next(error); }
    }

    static async getPipeline(req: Request, res: Response, next: NextFunction) {
        try {
            const pipeline = await LeadService.getPipelineSummary(req.branchScope);
            res.json({ success: true, data: pipeline });
        } catch (error) { next(error); }
    }
}
