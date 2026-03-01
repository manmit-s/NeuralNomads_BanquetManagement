import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { AppError, NotFoundError } from "../utils/errors.js";
import { randomUUID } from "crypto";

const SALT_ROUNDS = 10;

export class UserService {
    /**
     * Owner creates a team member (branch manager, sales, operations).
     * The owner sets the member's password.
     */
    static async createMember(data: {
        email: string;
        password: string;
        name: string;
        phone?: string;
        role: "BRANCH_MANAGER" | "SALES" | "OPERATIONS";
        branchId: string;
    }) {
        // Ensure email is unique
        const existing = await prisma.user.findUnique({ where: { email: data.email } });
        if (existing) {
            throw new AppError("An account with this email already exists", 400);
        }

        // Verify branch exists
        const branch = await prisma.branch.findUnique({ where: { id: data.branchId } });
        if (!branch || !branch.isActive) {
            throw new AppError("Branch not found or inactive", 400);
        }

        // Don't allow creating OWNER via this endpoint
        if ((data.role as string) === "OWNER") {
            throw new AppError("Cannot create additional owners", 403);
        }

        const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

        const user = await prisma.user.create({
            data: {
                authId: randomUUID(),
                email: data.email,
                passwordHash,
                name: data.name,
                phone: data.phone,
                role: data.role,
                branchId: data.branchId,
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                branchId: true,
                isActive: true,
                createdAt: true,
                branch: { select: { id: true, name: true, city: true } },
            },
        });

        return user;
    }

    /**
     * List all team members (optionally filtered by branch).
     */
    static async listMembers(branchId?: string) {
        const where: any = {};
        if (branchId) where.branchId = branchId;

        return prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                branchId: true,
                isActive: true,
                createdAt: true,
                branch: { select: { id: true, name: true, city: true } },
            },
            orderBy: [{ role: "asc" }, { name: "asc" }],
        });
    }

    /**
     * Update a team member (name, phone, role, branch, active status).
     */
    static async updateMember(
        id: string,
        data: {
            name?: string;
            phone?: string;
            role?: "BRANCH_MANAGER" | "SALES" | "OPERATIONS";
            branchId?: string;
            isActive?: boolean;
            password?: string; // owner can reset member password
        }
    ) {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundError("User");

        // Don't allow changing OWNER role
        if (user.role === "OWNER") {
            throw new AppError("Cannot modify owner account via this endpoint", 403);
        }

        const updateData: any = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.phone !== undefined) updateData.phone = data.phone;
        if (data.role !== undefined) updateData.role = data.role;
        if (data.branchId !== undefined) updateData.branchId = data.branchId;
        if (data.isActive !== undefined) updateData.isActive = data.isActive;
        if (data.password) {
            updateData.passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
        }

        return prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                branchId: true,
                isActive: true,
                createdAt: true,
                branch: { select: { id: true, name: true, city: true } },
            },
        });
    }
}
