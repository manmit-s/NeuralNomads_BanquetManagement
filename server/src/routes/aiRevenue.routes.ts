import { Router } from "express";
import { AIRevenueController } from "../controllers/aiRevenue.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { branchIsolation } from "../middleware/branchIsolation.js";

const router = Router();

router.use(authenticate, branchIsolation);

router.post("/revenue", authorize("OWNER", "BRANCH_MANAGER"), AIRevenueController.analyze);

export default router;
