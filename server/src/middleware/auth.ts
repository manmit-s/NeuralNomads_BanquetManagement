import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { prisma } from "../lib/prisma.js";
import { UnauthorizedError } from "../utils/errors.js";
import type { AuthUser } from "../types/index.js";

/**
 * Authenticate requests using a Supabase JWT.
 * Extracts the token from the Authorization header, verifies it,
 * then loads the full user profile from our database.
 */
export async function authenticate(req: Request, _res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            throw new UnauthorizedError("Missing or malformed authorization header");
        }

        const token = authHeader.split(" ")[1];

        // Verify the Supabase-issued JWT
        const decoded = jwt.verify(token, config.jwt.secret) as { sub: string; email: string };

        // Load our application user by Supabase Auth UID
        const user = await prisma.user.findUnique({
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

        if (!user || !user.isActive) {
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
