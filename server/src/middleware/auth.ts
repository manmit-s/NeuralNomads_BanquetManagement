import type { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service.js";
import { prisma } from "../lib/prisma.js";
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

        let rawToken = authHeader.split(" ")[1];
        const token = rawToken ? rawToken.replace(/['"]+/g, '') : "";

        // ── DEMO BYPASS ──
        if (token === "DEMO_TOKEN") {
            req.user = {
                id: "demo-owner",
                authId: "demo-auth",
                email: "demo@eventora.com",
                name: "Raj Patel",
                role: "OWNER",
                isActive: true,
                branchId: null
            } as unknown as AuthUser;
            return next();
        }

        // Verify our own JWT
        let decoded: { sub: string; email: string; role: string };
        try {
            decoded = AuthService.verifyToken(token);
        } catch {
            throw new UnauthorizedError("Invalid or expired token");
        }

        // Load app user by ID (sub = user.id)
        const user = await prisma.user.findUnique({
            where: { id: decoded.sub },
            select: {
                id: true,
                authId: true,
                email: true,
                name: true,
                role: true,
                branchId: true,
                isActive: true,
            },
        });

        if (!user || !user.isActive) {
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
