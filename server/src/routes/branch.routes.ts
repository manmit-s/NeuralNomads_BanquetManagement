import { Router } from "express";
import { BranchController } from "../controllers/branch.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { createBranchSchema, updateBranchSchema } from "../validators/schemas.js";

const router = Router();

// All branch routes require authentication
router.use(authenticate);

router.get("/", BranchController.getAll);
router.get("/:id", BranchController.getById);

// Only owners can create / update / deactivate branches
router.post("/", authorize("OWNER"), validate(createBranchSchema), BranchController.create);
router.patch("/:id", authorize("OWNER"), validate(updateBranchSchema), BranchController.update);
router.delete("/:id", authorize("OWNER"), BranchController.deactivate);

export default router;
