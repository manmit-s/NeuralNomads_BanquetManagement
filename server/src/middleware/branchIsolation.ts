import type { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../utils/errors.js";

/**
 * Branch Isolation Middleware
 *
 * Ensures non-owner users can only access data belonging to their branch.
 * Attaches `req.branchScope` which services use for filtering.
 *
 * - OWNER: branchScope is undefined → full access.
 * - Others: branchScope is their assigned branchId.
 *
 * If a branch-specific route param `:branchId` is present, it validates
 * the user is allowed to access that branch.
 */

declare global {
    namespace Express {
        interface Request {
            branchScope?: string; // undefined = all branches (owner)
        }
    }
}

export function branchIsolation(req: Request, _res: Response, next: NextFunction) {
    if (!req.user) {
        return next(new ForbiddenError());
    }

    // Owners have global access
    if (req.user.role === "OWNER") {
        // If a specific branchId is requested via query or param, allow it
        req.branchScope = (req.params.branchId as string) || (req.query.branchId as string) || undefined;
        return next();
    }

    // Non-owners MUST have a branchId
    if (!req.user.branchId) {
        return next(new ForbiddenError("User is not assigned to any branch"));
    }

    // If route targets a specific branch, ensure it matches
    const targetBranch = req.params.branchId || (req.query.branchId as string);
    if (targetBranch && targetBranch !== req.user.branchId) {
        return next(new ForbiddenError("Access denied to this branch"));
    }

    req.branchScope = req.user.branchId;
    next();
}
