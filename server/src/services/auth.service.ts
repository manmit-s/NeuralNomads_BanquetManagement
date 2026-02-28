import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { config } from "../config/index.js";
import type { AuthUser } from "../types/index.js";
import { AppError, UnauthorizedError } from "../utils/errors.js";
import { randomUUID } from "crypto";

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = "7d"; // 7 days

export class AuthService {
    /**
     * Register a new user with email + password.
     * First user automatically becomes OWNER.
     */
    static async signUp(data: {
        email: string;
        password: string;
        name: string;
        phone?: string;
        role?: "OWNER" | "BRANCH_MANAGER" | "SALES" | "OPERATIONS";
        branchId?: string;
    }) {
        // Check if email already exists
        const existing = await prisma.user.findUnique({ where: { email: data.email } });
        if (existing) {
            throw new AppError("An account with this email already exists", 400);
        }

        // Auto-detect role: first user is OWNER
        const userCount = await prisma.user.count();
        const role = userCount === 0 ? "OWNER" : (data.role || "BRANCH_MANAGER");

        // Hash password
        const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

        // Create user
        const user = await prisma.user.create({
            data: {
                authId: randomUUID(), // auto-generated unique ID
                email: data.email,
                passwordHash,
                name: data.name,
                phone: data.phone,
                role,
                branchId: role === "OWNER" ? null : data.branchId,
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                branchId: true,
                isActive: true,
            },
        });

        // Generate JWT
        const token = AuthService.generateToken(user);

        return {
            user,
            token,
        };
    }

    /**
     * Sign in with email + password.
     */
    static async signIn(email: string, password: string) {
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                authId: true,
                email: true,
                passwordHash: true,
                name: true,
                phone: true,
                role: true,
                branchId: true,
                isActive: true,
            },
        });

        if (!user || !user.isActive) {
            throw new UnauthorizedError("Invalid email or password");
        }

        // If user has no password hash (legacy/demo user), deny login
        if (!user.passwordHash) {
            throw new UnauthorizedError("Account requires password reset. Please sign up again.");
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            throw new UnauthorizedError("Invalid email or password");
        }

        const token = AuthService.generateToken(user);

        // Remove passwordHash from response
        const { passwordHash: _, ...safeUser } = user;

        return {
            user: safeUser,
            token,
        };
    }

    /**
     * Get the authenticated user's profile.
     */
    static async getProfile(authUser: AuthUser) {
        return prisma.user.findUnique({
            where: { id: authUser.id },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                branchId: true,
                isActive: true,
                branch: { select: { id: true, name: true, city: true } },
                createdAt: true,
            },
        });
    }

    /**
     * Generate a signed JWT for the given user.
     */
    private static generateToken(user: { id: string; email: string; role: string }) {
        return jwt.sign(
            { sub: user.id, email: user.email, role: user.role },
            config.jwt.secret,
            { expiresIn: TOKEN_EXPIRY }
        );
    }

    /**
     * Verify and decode a JWT. Returns the payload or throws.
     */
    static verifyToken(token: string): { sub: string; email: string; role: string } {
        return jwt.verify(token, config.jwt.secret) as { sub: string; email: string; role: string };
    }
}
