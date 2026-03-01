import type { Request, Response, NextFunction } from "express";
import { EventService } from "../services/event.service.js";
import { InventoryService } from "../services/inventory.service.js";

export class EventController {
    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const events = await EventService.findAll(req.branchScope);
            res.json({ success: true, data: events });
        } catch (error) { next(error); }
    }

    static async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const event = await EventService.findById(req.params.id as string, req.branchScope);
            res.json({ success: true, data: event });
        } catch (error) { next(error); }
    }

    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const event = await EventService.create(req.body);
            res.status(201).json({ success: true, data: event });
        } catch (error) { next(error); }
    }

    static async addMenuItems(req: Request, res: Response, next: NextFunction) {
        try {
            const event = await EventService.addMenuItems(req.params.id as string, req.body.items);
            res.json({ success: true, data: event });
        } catch (error) { next(error); }
    }

    /**
     * Finalize menu — triggers inventory auto-deduction.
     */
    static async finalizeMenu(req: Request, res: Response, next: NextFunction) {
        try {
            const event = await EventService.findById(req.params.id as string, req.branchScope) as any;

            const menuItems = (event.menuSelections || []).map((ms: { menuItemId: string; quantity: number }) => ({
                menuItemId: ms.menuItemId,
                quantity: ms.quantity,
            }));

            const result = await InventoryService.deductForEvent(
                event.id,
                menuItems,
                event.guestCount
            );

            res.json({
                success: true,
                data: result,
                message: result.warnings.length > 0
                    ? `Menu finalized. ${result.warnings.length} item(s) below minimum stock level.`
                    : "Menu finalized. All stock levels are healthy.",
            });
        } catch (error) { next(error); }
    }

    static async addVendor(req: Request, res: Response, next: NextFunction) {
        try {
            const event = await EventService.addVendor(req.params.id as string, req.body);
            res.json({ success: true, data: event });
        } catch (error) { next(error); }
    }

    static async addChecklistItem(req: Request, res: Response, next: NextFunction) {
        try {
            const event = await EventService.addChecklistItem(req.params.id as string, req.body);
            res.json({ success: true, data: event });
        } catch (error) { next(error); }
    }

    static async updateChecklistItem(req: Request, res: Response, next: NextFunction) {
        try {
            const item = await EventService.updateChecklistItem(req.params.checklistId as string, req.body.status);
            res.json({ success: true, data: item });
        } catch (error) { next(error); }
    }
}
