import type { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service.js";
import { prisma } from "../lib/prisma.js";
import { supabaseAdmin } from "../lib/supabase.js";
import { UnauthorizedError } from "../utils/errors.js";
import type { AuthUser } from "../types/index.js";

/**
 * Authenticate requests using our self-signed JWT.
 * Extracts the token from the Authorization header, verifies it,
 * and loads the corresponding user from the database.
 */
export async function authenticate(req: Request, _res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ") || !authHeader.split(" ")[1]) {
            throw new UnauthorizedError("Missing or malformed authorization header");
        }

        const token = authHeader.split(" ")[1];

        // Verify our own JWT
        let decoded: { sub: string; email: string; role: string };
        try {
            decoded = AuthService.verifyToken(token);
        } catch {
            throw new UnauthorizedError("Invalid or expired token");
        }

        // Load app user — use Supabase REST for stability
        const { data: user, error: dbError } = await supabaseAdmin
            .from("users")
            .select("id, authId, email, name, role, branchId, isActive")
            .eq("id", decoded.sub)
            .single();

        if (dbError || !user || !user.isActive) {
            throw new UnauthorizedError("User not found or deactivated");
        }

        if (dbError || !user || !user.isActive) {
            throw new UnauthorizedError("User not found or deactivated");
        }

        req.user = user as AuthUser;
        next();
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            next(error);
        } else {
            next(new UnauthorizedError("Authentication failed"));
        }
    }
}
