import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { prisma } from "../lib/prisma.js";
import { UnauthorizedError } from "../utils/errors.js";
import type { AuthUser } from "../types/index.js";

/**
 * DEV-MODE demo user — injected when no valid JWT is provided in development.
 * This allows the frontend to work without real Supabase authentication.
 * Uses a real DB user so foreign-key constraints are satisfied on writes.
 */
let DEV_DEMO_USER: AuthUser | null = null;

async function getDevDemoUser(): Promise<AuthUser> {
    if (DEV_DEMO_USER) return DEV_DEMO_USER;

    // Try to find an existing OWNER user in the database
    try {
        const owner = await prisma.user.findFirst({
            where: { role: "OWNER", isActive: true },
            select: { id: true, authId: true, email: true, name: true, role: true, branchId: true },
        });
        if (owner) {
            DEV_DEMO_USER = { ...owner, branchId: owner.branchId ?? null } as AuthUser;
            console.log(`[Auth] Dev demo user resolved to DB user: ${owner.name} (${owner.id})`);
            return DEV_DEMO_USER;
        }
    } catch {
        // DB unreachable — use fallback
    }

    // Fallback: create or upsert a demo user in the DB
    try {
        const demo = await prisma.user.upsert({
            where: { email: "demo@eventora.com" },
            update: {},
            create: {
                authId: "dev-demo-auth",
                email: "demo@eventora.com",
                name: "Raj Patel (Demo)",
                role: "OWNER",
                isActive: true,
            },
            select: { id: true, authId: true, email: true, name: true, role: true, branchId: true },
        });
        DEV_DEMO_USER = { ...demo, branchId: demo.branchId ?? null } as AuthUser;
        console.log(`[Auth] Dev demo user created/found: ${demo.id}`);
        return DEV_DEMO_USER;
    } catch {
        // Absolute last resort — return a hardcoded object (writes will fail but reads work)
        return {
            id: "dev-demo-owner",
            authId: "dev-demo-auth",
            email: "demo@eventora.com",
            name: "Raj Patel",
            role: "OWNER",
            branchId: null,
        };
    }
}

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
                req.user = await getDevDemoUser();
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
                req.user = await getDevDemoUser();
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
                req.user = await getDevDemoUser();
                return next();
            }
            throw new UnauthorizedError("Database error during authentication");
        }

        if (!user || !user.isActive) {
            if (config.nodeEnv === "development") {
                req.user = await getDevDemoUser();
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
