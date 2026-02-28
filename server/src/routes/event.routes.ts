import { Router } from "express";
import { EventController } from "../controllers/event.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { branchIsolation } from "../middleware/branchIsolation.js";
import { validate } from "../middleware/validate.js";
import {
    createEventSchema,
    addMenuToEventSchema,
    addVendorToEventSchema,
    addChecklistItemSchema,
    updateChecklistItemSchema,
} from "../validators/schemas.js";

const router = Router();

router.use(authenticate, branchIsolation);

router.get("/", authorize("OWNER", "BRANCH_MANAGER", "OPERATIONS"), EventController.getAll);
router.get("/:id", authorize("OWNER", "BRANCH_MANAGER", "OPERATIONS"), EventController.getById);
router.post("/", authorize("OWNER", "BRANCH_MANAGER"), validate(createEventSchema), EventController.create);

// Menu
router.post("/:id/menu", authorize("OWNER", "BRANCH_MANAGER", "OPERATIONS"), validate(addMenuToEventSchema), EventController.addMenuItems);
router.post("/:id/menu/finalize", authorize("OWNER", "BRANCH_MANAGER"), EventController.finalizeMenu);

// Vendors
router.post("/:id/vendors", authorize("OWNER", "BRANCH_MANAGER", "OPERATIONS"), validate(addVendorToEventSchema), EventController.addVendor);

// Checklist
router.post("/:id/checklist", authorize("OWNER", "BRANCH_MANAGER", "OPERATIONS"), validate(addChecklistItemSchema), EventController.addChecklistItem);
router.patch("/checklist/:checklistId", authorize("OWNER", "BRANCH_MANAGER", "OPERATIONS"), validate(updateChecklistItemSchema), EventController.updateChecklistItem);

export default router;
