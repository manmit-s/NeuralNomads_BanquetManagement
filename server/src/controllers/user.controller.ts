import type { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service.js";

export class UserController {
    static async createMember(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await UserService.createMember(req.body);
            res.status(201).json({ success: true, data: user });
        } catch (error) { next(error); }
    }

    static async listMembers(req: Request, res: Response, next: NextFunction) {
        try {
            const branchId = req.query.branchId as string | undefined;
            const users = await UserService.listMembers(branchId);
            res.json({ success: true, data: users });
        } catch (error) { next(error); }
    }

    static async updateMember(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await UserService.updateMember(req.params.id as string, req.body);
            res.json({ success: true, data: user });
        } catch (error) { next(error); }
    }
}
