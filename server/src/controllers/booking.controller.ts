import type { Request, Response, NextFunction } from "express";
import { BookingService } from "../services/booking.service.js";
import { parsePagination } from "../utils/helpers.js";
import { calculateEventHealth } from "../utils/eventHealth.js";

export class BookingController {
    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const pagination = parsePagination(req.query as Record<string, unknown>);
            const filters = {
                status: req.query.status as string | undefined,
                hallId: req.query.hallId as string | undefined,
            };
            const result = await BookingService.findAll(req.branchScope, pagination, filters);
            const data = result.data.map((b: any) => {
                const health = calculateEventHealth(b);
                return { ...b, healthScore: health.score, healthLabel: health.label, healthBreakdown: health.breakdown };
            });
            res.json({ success: true, data, meta: result.meta });
        } catch (error) { next(error); }
    }

    static async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const booking = await BookingService.findById(req.params.id as string, req.branchScope);
            res.json({ success: true, data: booking });
        } catch (error) { next(error); }
    }

    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const booking = await BookingService.create(req.body, req.user!.id);
            res.status(201).json({ success: true, data: booking });
        } catch (error) { next(error); }
    }

    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const booking = await BookingService.update(req.params.id as string, req.body, req.branchScope);
            res.json({ success: true, data: booking });
        } catch (error) { next(error); }
    }

    static async getAvailability(req: Request, res: Response, next: NextFunction) {
        try {
            const { hallId, from, to } = req.query;
            const bookings = await BookingService.getAvailability(
                hallId as string,
                new Date(from as string),
                new Date(to as string),
                req.branchScope
            );
            res.json({ success: true, data: bookings });
        } catch (error) { next(error); }
    }
}
