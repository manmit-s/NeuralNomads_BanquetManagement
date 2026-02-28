import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors.js";

/**
 * Global error handler — catches all errors and returns a consistent JSON shape.
 */
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
    // Known operational errors
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.message,
        });
    }

    // Prisma known errors
    if ((err as any).code === "P2002") {
        return res.status(409).json({
            success: false,
            error: "A record with this value already exists",
        });
    }

    if ((err as any).code === "P2025") {
        return res.status(404).json({
            success: false,
            error: "Record not found",
        });
    }

    // Unexpected errors
    console.error("Unhandled error:", err);
    return res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
    });
}
