import { Router } from "express";
import { RevenueController } from "../controllers/revenue.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { branchIsolation } from "../middleware/branchIsolation.js";

const router = Router();

router.use(authenticate, branchIsolation);

router.get("/performance", authorize("OWNER", "BRANCH_MANAGER"), RevenueController.getPerformance);
router.get("/insights", authorize("OWNER", "BRANCH_MANAGER"), RevenueController.getInsights);
router.get("/simulate", authorize("OWNER", "BRANCH_MANAGER"), RevenueController.simulate);

export default router;
