import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { supabaseAdmin } from "../lib/supabase.js";
import { config } from "../config/index.js";
import type { AuthUser } from "../types/index.js";
import { AppError, UnauthorizedError } from "../utils/errors.js";
import { randomUUID } from "crypto";

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = "7d"; // 7 days

export class AuthService {
    /**
     * Register a new OWNER (first-time setup only).
     * Subsequent staff members are created via UserService by the owner.
     */
    static async signUp(data: {
        email: string;
        password: string;
        name: string;
        phone?: string;
    }) {
        // Only allow signup if no users exist (first user = OWNER)
        // Check using Supabase for consistency
        const { count, error: countErr } = await supabaseAdmin
            .from("users")
            .select("*", { count: "exact", head: true });

        if (countErr) {
            console.error("Signup check error:", countErr);
        }

        if (count && count > 0) {
            throw new AppError("An owner already exists. Staff accounts are created by the owner from the Team page.", 403);
        }

        // Check if email already exists
        const { data: existing } = await supabaseAdmin
            .from("users")
            .select("id")
            .eq("email", data.email)
            .single();

        if (existing) {
            throw new AppError("An account with this email already exists", 400);
        }

        // Hash password
        const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

        // Create OWNER user
        const { data: user, error: dbError } = await supabaseAdmin
            .from("users")
            .insert({
                id: randomUUID(),
                authId: randomUUID(),
                email: data.email,
                passwordHash,
                name: data.name,
                phone: data.phone || null,
                role: "OWNER",
                branchId: null,
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            })
            .select("id, email, name, phone, role, branchId, isActive")
            .single();

        if (dbError) {
            console.error("DB Error during signup:", JSON.stringify(dbError, null, 2));
            throw new AppError(`Failed to create user profile: ${dbError.message}`, 500);
        }

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
        // Find user by email
        const { data: user, error: dbError } = await supabaseAdmin
            .from("users")
            .select("*")
            .eq("email", email)
            .single();

        if (dbError || !user || !user.isActive) {
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
        const { data: user, error: dbError } = await supabaseAdmin
            .from("users")
            .select("*, branch:branches(id, name, city)")
            .eq("id", authUser.id)
            .single();

        if (dbError) {
            console.error("getProfile DB Error:", dbError);
            return null;
        }

        return user;
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
