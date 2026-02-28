import { Router } from "express";
import { ReportController } from "../controllers/report.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { branchIsolation } from "../middleware/branchIsolation.js";

const router = Router();

router.use(authenticate, branchIsolation);

router.get("/dashboard", authorize("OWNER", "BRANCH_MANAGER"), ReportController.dashboard);
router.get("/revenue", authorize("OWNER", "BRANCH_MANAGER"), ReportController.branchRevenue);
router.get("/conversion", authorize("OWNER", "BRANCH_MANAGER"), ReportController.conversionRate);
router.get("/occupancy", authorize("OWNER", "BRANCH_MANAGER"), ReportController.occupancyRate);
router.get("/outstanding", authorize("OWNER", "BRANCH_MANAGER"), ReportController.outstandingSummary);

export default router;
