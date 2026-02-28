import { Router } from "express";
import { LeadController } from "../controllers/lead.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { branchIsolation } from "../middleware/branchIsolation.js";
import { validate } from "../middleware/validate.js";
import { createLeadSchema, updateLeadSchema } from "../validators/schemas.js";

const router = Router();

router.use(authenticate, branchIsolation);

router.get("/", authorize("OWNER", "BRANCH_MANAGER", "SALES"), LeadController.getAll);
router.get("/pipeline", authorize("OWNER", "BRANCH_MANAGER", "SALES"), LeadController.getPipeline);
router.get("/:id", authorize("OWNER", "BRANCH_MANAGER", "SALES"), LeadController.getById);
router.post("/", authorize("OWNER", "BRANCH_MANAGER", "SALES"), validate(createLeadSchema), LeadController.create);
router.patch("/:id", authorize("OWNER", "BRANCH_MANAGER", "SALES"), validate(updateLeadSchema), LeadController.update);

export default router;
