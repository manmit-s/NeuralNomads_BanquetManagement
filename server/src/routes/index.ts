import { Router } from "express";
import authRoutes from "./auth.routes.js";
import branchRoutes from "./branch.routes.js";
import userRoutes from "./user.routes.js";
import hallRoutes from "./hall.routes.js";
import leadRoutes from "./lead.routes.js";
import bookingRoutes from "./booking.routes.js";
import eventRoutes from "./event.routes.js";
import inventoryRoutes from "./inventory.routes.js";
import billingRoutes from "./billing.routes.js";
import reportRoutes from "./report.routes.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/branches", branchRoutes);
router.use("/users", userRoutes);
router.use("/halls", hallRoutes);
router.use("/leads", leadRoutes);
router.use("/bookings", bookingRoutes);
router.use("/events", eventRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/billing", billingRoutes);
router.use("/reports", reportRoutes);

// Health check (no auth needed)
router.get("/health", async (_req, res) => {
    let dbStatus = "disconnected";
    try {
        await prisma.$queryRaw`SELECT 1`;
        dbStatus = "connected";
    } catch (e: any) {
        dbStatus = `error: ${e.message?.slice(0, 120)}`;
    }
    res.json({
        success: true,
        message: "API is running",
        database: dbStatus,
        timestamp: new Date().toISOString(),
    });
});

export default router;
