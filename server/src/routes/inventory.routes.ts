import { Router } from "express";
import { InventoryController } from "../controllers/inventory.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { branchIsolation } from "../middleware/branchIsolation.js";
import { validate } from "../middleware/validate.js";
import { createInventoryItemSchema, updateInventoryItemSchema, stockAdjustmentSchema } from "../validators/schemas.js";

const router = Router();

router.use(authenticate, branchIsolation);

router.get("/", authorize("OWNER", "BRANCH_MANAGER", "OPERATIONS"), InventoryController.getAll);
router.get("/low-stock", authorize("OWNER", "BRANCH_MANAGER", "OPERATIONS"), InventoryController.getLowStock);
router.get("/:id", authorize("OWNER", "BRANCH_MANAGER", "OPERATIONS"), InventoryController.getById);
router.post("/", authorize("OWNER", "BRANCH_MANAGER"), validate(createInventoryItemSchema), InventoryController.create);
router.patch("/:id", authorize("OWNER", "BRANCH_MANAGER"), validate(updateInventoryItemSchema), InventoryController.update);
router.post("/:id/adjust", authorize("OWNER", "BRANCH_MANAGER", "OPERATIONS"), validate(stockAdjustmentSchema), InventoryController.adjustStock);

export default router;
