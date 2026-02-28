import { Role } from "@prisma/client";

// Authenticated user attached to req.user by auth middleware
export interface AuthUser {
    id: string;        // User table id (cuid)
    authId: string;    // Supabase Auth UID
    email: string;
    name: string;
    role: Role;
    branchId: string | null;
}

// Extend Express Request
declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}

// Standard API response shape
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
}

// Pagination query params
export interface PaginationParams {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}
