import type { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { ForbiddenError, UnauthorizedError } from "../utils/errors.js";

/**
 * Restrict access to specific roles.
 *
 * Usage: `authorize(Role.OWNER, Role.BRANCH_MANAGER)`
 */
export function authorize(...allowedRoles: Role[]) {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new UnauthorizedError());
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(new ForbiddenError());
        }

        next();
    };
}
