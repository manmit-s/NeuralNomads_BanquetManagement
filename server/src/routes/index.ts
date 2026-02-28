import { Router } from "express";
import authRoutes from "./auth.routes.js";
import branchRoutes from "./branch.routes.js";
import leadRoutes from "./lead.routes.js";
import bookingRoutes from "./booking.routes.js";
import eventRoutes from "./event.routes.js";
import inventoryRoutes from "./inventory.routes.js";
import billingRoutes from "./billing.routes.js";
import reportRoutes from "./report.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/branches", branchRoutes);
router.use("/leads", leadRoutes);
router.use("/bookings", bookingRoutes);
router.use("/events", eventRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/billing", billingRoutes);
router.use("/reports", reportRoutes);

// Health check
router.get("/health", (_req, res) => {
    res.json({ success: true, message: "API is running", timestamp: new Date().toISOString() });
});

export default router;
