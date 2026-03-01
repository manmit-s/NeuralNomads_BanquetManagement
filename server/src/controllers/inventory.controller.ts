import type { Request, Response, NextFunction } from "express";
import { InventoryService } from "../services/inventory.service.js";

export class InventoryController {
    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const items = await InventoryService.findAll(req.branchScope);
            res.json({ success: true, data: items });
        } catch (error) { next(error); }
    }

    static async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const item = await InventoryService.findById(req.params.id as string);
            res.json({ success: true, data: item });
        } catch (error) { next(error); }
    }

    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const body = { ...req.body };

            // Auto-assign branchId if not provided
            if (!body.branchId || body.branchId === "") {
                if (req.user!.branchId) {
                    body.branchId = req.user!.branchId;
                } else if (req.user!.role === "OWNER") {
                    // OWNER with no branch — find a default branch
                    const { supabaseAdmin } = await import("../lib/supabase.js");
                    const { data: branches } = await supabaseAdmin
                        .from("branches")
                        .select("id")
                        .limit(1);

                    if (branches && branches.length > 0) {
                        body.branchId = branches[0].id;
                    } else {
                        throw new Error("No branch available to assign inventory item");
                    }
                }
            }

            const item = await InventoryService.create(body);
            res.status(201).json({ success: true, data: item });
        } catch (error) { next(error); }
    }

    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const item = await InventoryService.update(req.params.id as string, req.body);
            res.json({ success: true, data: item });
        } catch (error) { next(error); }
    }

    static async adjustStock(req: Request, res: Response, next: NextFunction) {
        try {
            const item = await InventoryService.adjustStock(
                req.params.id as string,
                req.body.type,
                req.body.quantity,
                req.body.notes
            );
            res.json({ success: true, data: item });
        } catch (error) { next(error); }
    }

    static async getLowStock(req: Request, res: Response, next: NextFunction) {
        try {
            const items = await InventoryService.getLowStockItems(req.branchScope);
            res.json({ success: true, data: items });
        } catch (error) { next(error); }
    }
}
