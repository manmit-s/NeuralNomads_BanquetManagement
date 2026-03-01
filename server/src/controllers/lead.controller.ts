import type { Request, Response, NextFunction } from "express";
import { LeadService } from "../services/lead.service.js";
import { parsePagination } from "../utils/helpers.js";
import { supabaseAdmin } from "../lib/supabase.js";

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
            const lead = await LeadService.findById(req.params.id as string, req.branchScope);
            res.json({ success: true, data: lead });
        } catch (error) { next(error); }
    }

    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("[LeadController.create] Incoming Body:", req.body);
            const body = { ...req.body };

            // Auto-assign the current user if no assignedToId provided or set to "auto"
            if (!body.assignedToId || body.assignedToId === "" || body.assignedToId === "auto") {
                body.assignedToId = req.user!.id;
            }

            // Auto-assign branchId if not provided
            if (!body.branchId || body.branchId === "") {
                if (req.user!.branchId) {
                    body.branchId = req.user!.branchId;
                } else {
                    // OWNER with no branch — find or create a default branch
                    const { data: branches } = await supabaseAdmin
                        .from("branches")
                        .select("id")
                        .limit(1);

                    if (branches && branches.length > 0) {
                        body.branchId = branches[0].id;
                    } else {
                        const { data: newBranch, error: brErr } = await supabaseAdmin
                            .from("branches")
                            .insert({
                                id: crypto.randomUUID(),
                                name: "Main Branch",
                                address: "Default Address",
                                city: "Default City",
                                phone: "0000000000",
                                email: "branch@eventora.com",
                                isActive: true,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                            })
                            .select()
                            .single();

                        if (brErr) {
                            console.error("Failed to create default branch:", brErr);
                            const errMsg = typeof brErr === 'string' ? brErr : JSON.stringify(brErr);
                            throw new Error(`Failed to create fallback branch: ${errMsg}`);
                        }
                        body.branchId = newBranch.id;
                    }
                }
            }

            const lead = await LeadService.create(body, req.user!.id);
            res.status(201).json({ success: true, data: lead });
        } catch (error) { next(error); }
    }

    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const lead = await LeadService.update(req.params.id as string, req.body, req.user!.id, req.branchScope);
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
