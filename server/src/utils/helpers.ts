import type { PaginationParams } from "../types/index.js";

/**
 * Parse pagination from query string with safe defaults.
 */
export function parsePagination(query: Record<string, unknown>): PaginationParams {
    const page = Math.max(1, parseInt(String(query.page || "1"), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(query.limit || "20"), 10)));
    const sortBy = typeof query.sortBy === "string" ? query.sortBy : "createdAt";
    const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";
    return { page, limit, sortBy, sortOrder };
}

/**
 * Generate a sequential reference number.
 * Example: generateRefNumber("BK", 42) => "BK-2026-042"
 */
export function generateRefNumber(prefix: string, sequence: number): string {
    const year = new Date().getFullYear();
    return `${prefix}-${year}-${String(sequence).padStart(3, "0")}`;
}
