import { Router } from "express";
import { branchHealthController } from "../controllers/branchHealth.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { branchIsolation } from "../middleware/branchIsolation.js";

const router = Router();

router.use(authenticate, branchIsolation);

router.post("/branch-health", authorize("OWNER", "BRANCH_MANAGER"), branchHealthController);

export default router;
