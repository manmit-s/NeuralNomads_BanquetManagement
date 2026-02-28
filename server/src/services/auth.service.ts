import { prisma } from "../lib/prisma.js";
import { supabaseAdmin } from "../lib/supabase.js";
import type { AuthUser } from "../types/index.js";
import { AppError, UnauthorizedError } from "../utils/errors.js";

export class AuthService {
    /**
     * Register a new user via Supabase Auth, then create an app-level profile.
     */
    static async signUp(data: {
        email: string;
        password: string;
        name: string;
        phone?: string;
        role: "OWNER" | "BRANCH_MANAGER" | "SALES" | "OPERATIONS";
        branchId?: string;
    }) {
        // 1. Create user in Supabase Auth
        const { data: authData, error } = await supabaseAdmin.auth.admin.createUser({
            email: data.email,
            password: data.password,
            email_confirm: true,
        });

        if (error || !authData.user) {
            throw new AppError(error?.message || "Failed to create auth user", 400);
        }

        // 2. Create app user in our database
        const user = await prisma.user.create({
            data: {
                authId: authData.user.id,
                email: data.email,
                name: data.name,
                phone: data.phone,
                role: data.role,
                branchId: data.role === "OWNER" ? null : data.branchId,
            },
        });

        return user;
    }

    /**
     * Sign in via Supabase and return the session tokens + user profile.
     */
    static async signIn(email: string, password: string) {
        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
            email,
            password,
        });

        if (error || !data.session) {
            throw new UnauthorizedError("Invalid email or password");
        }

        // Load our app user
        const user = await prisma.user.findUnique({
            where: { authId: data.user.id },
        });

        if (!user || !user.isActive) {
            throw new UnauthorizedError("User account not found or deactivated");
        }

        return {
            user,
            session: {
                accessToken: data.session.access_token,
                refreshToken: data.session.refresh_token,
                expiresAt: data.session.expires_at,
            },
        };
    }

    /**
     * Get the authenticated user's profile.
     */
    static async getProfile(authUser: AuthUser) {
        return prisma.user.findUnique({
            where: { id: authUser.id },
            include: { branch: true },
        });
    }
}
