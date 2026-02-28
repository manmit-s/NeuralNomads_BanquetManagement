import { Router } from "express";
import { BranchController } from "../controllers/branch.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { createBranchSchema, updateBranchSchema } from "../validators/schemas.js";

const router = Router();

// Public route — needed for signup page branch selector
router.get("/", BranchController.getAll);
router.get("/:id", BranchController.getById);

// Protected routes
router.use(authenticate);

// Only owners can create / update / deactivate branches
router.post("/", authorize("OWNER"), validate(createBranchSchema), BranchController.create);
router.patch("/:id", authorize("OWNER"), validate(updateBranchSchema), BranchController.update);
router.delete("/:id", authorize("OWNER"), BranchController.deactivate);

export default router;
