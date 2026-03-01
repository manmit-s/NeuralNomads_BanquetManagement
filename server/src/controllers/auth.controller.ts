import type { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service.js";

export class AuthController {
    static async signUp(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await AuthService.signUp(req.body);
            res.status(201).json({ success: true, data: result });
        } catch (error) { next(error); }
    }

    static async signIn(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await AuthService.signIn(req.body.email, req.body.password);
            res.json({ success: true, data: result });
        } catch (error) { next(error); }
    }

    static async getProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const profile = await AuthService.getProfile(req.user!);
            res.json({ success: true, data: profile });
        } catch (error) { next(error); }
    }
}
