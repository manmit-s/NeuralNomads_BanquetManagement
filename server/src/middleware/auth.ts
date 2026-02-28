import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { prisma } from "../lib/prisma.js";
import { UnauthorizedError } from "../utils/errors.js";
import type { AuthUser } from "../types/index.js";

/**
 * DEV-MODE demo user — injected when no valid JWT is provided in development.
 * This allows the frontend to work without real Supabase authentication.
 */
const DEV_DEMO_USER: AuthUser = {
    id: "dev-demo-owner",
    authId: "dev-demo-auth",
    email: "demo@eventora.com",
    name: "Raj Patel",
    role: "OWNER",
    branchId: null, // OWNER sees all branches
};

/**
 * Authenticate requests using a Supabase JWT.
 * In development mode, falls back to a demo user if no valid token is present.
 */
export async function authenticate(req: Request, _res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;

        // ── Dev bypass: no token → inject demo user ──
        if (!authHeader?.startsWith("Bearer ") || !authHeader.split(" ")[1]) {
            if (config.nodeEnv === "development") {
                req.user = DEV_DEMO_USER;
                return next();
            }
            throw new UnauthorizedError("Missing or malformed authorization header");
        }

        const token = authHeader.split(" ")[1];

        let decoded: { sub: string; email: string };
        try {
            decoded = jwt.verify(token, config.jwt.secret) as { sub: string; email: string };
        } catch {
            // Token invalid — in dev, fall back to demo user
            if (config.nodeEnv === "development") {
                req.user = DEV_DEMO_USER;
                return next();
            }
            throw new UnauthorizedError("Invalid or expired token");
        }

        // Load our application user by Supabase Auth UID
        let user;
        try {
            user = await prisma.user.findUnique({
                where: { authId: decoded.sub },
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
        } catch {
            // DB unreachable — in dev fall back to demo user
            if (config.nodeEnv === "development") {
                req.user = DEV_DEMO_USER;
                return next();
            }
            throw new UnauthorizedError("Database error during authentication");
        }

        if (!user || !user.isActive) {
            if (config.nodeEnv === "development") {
                req.user = DEV_DEMO_USER;
                return next();
            }
            throw new UnauthorizedError("User not found or deactivated");
        }

        req.user = user as AuthUser;
        next();
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            next(error);
        } else {
            next(new UnauthorizedError("Invalid or expired token"));
        }
    }
}
