import { Router } from "express";
import { aiReviewController, demoReviewController } from "../controllers/aiReview.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { branchIsolation } from "../middleware/branchIsolation.js";

const router = Router();

router.use(authenticate, branchIsolation);

router.post("/reviews", authorize("OWNER", "BRANCH_MANAGER"), aiReviewController);
router.get("/reviews/demo", authorize("OWNER", "BRANCH_MANAGER"), demoReviewController);

export default router;
