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
            const item = await InventoryService.findById(req.params.id);
            res.json({ success: true, data: item });
        } catch (error) { next(error); }
    }

    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const item = await InventoryService.create(req.body);
            res.status(201).json({ success: true, data: item });
        } catch (error) { next(error); }
    }

    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const item = await InventoryService.update(req.params.id, req.body);
            res.json({ success: true, data: item });
        } catch (error) { next(error); }
    }

    static async adjustStock(req: Request, res: Response, next: NextFunction) {
        try {
            const item = await InventoryService.adjustStock(
                req.params.id,
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
