import type { Request, Response, NextFunction } from "express";
import { BillingService } from "../services/billing.service.js";

export class BillingController {
    // ── Invoices ──
    static async createInvoice(req: Request, res: Response, next: NextFunction) {
        try {
            const invoice = await BillingService.createInvoice(req.body);
            res.status(201).json({ success: true, data: invoice });
        } catch (error) { next(error); }
    }

    static async getInvoice(req: Request, res: Response, next: NextFunction) {
        try {
            const invoice = await BillingService.findInvoice(req.params.id as string, req.branchScope);
            res.json({ success: true, data: invoice });
        } catch (error) { next(error); }
    }

    static async getAllInvoices(req: Request, res: Response, next: NextFunction) {
        try {
            const invoices = await BillingService.findAllInvoices(req.branchScope, req.query.status as string);
            res.json({ success: true, data: invoices });
        } catch (error) { next(error); }
    }

    // ── Payments ──
    static async recordPayment(req: Request, res: Response, next: NextFunction) {
        try {
            const payment = await BillingService.recordPayment(req.body, req.user!.id);
            res.status(201).json({ success: true, data: payment });
        } catch (error) { next(error); }
    }

    static async getOutstanding(req: Request, res: Response, next: NextFunction) {
        try {
            const invoices = await BillingService.getOutstanding(req.branchScope);
            res.json({ success: true, data: invoices });
        } catch (error) { next(error); }
    }
}
