import { Router } from "express";
import { BookingController } from "../controllers/booking.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { branchIsolation } from "../middleware/branchIsolation.js";
import { validate } from "../middleware/validate.js";
import { createBookingSchema, updateBookingSchema } from "../validators/schemas.js";

const router = Router();

router.use(authenticate, branchIsolation);

router.get("/", authorize("OWNER", "BRANCH_MANAGER", "SALES", "OPERATIONS"), BookingController.getAll);
router.get("/availability", authorize("OWNER", "BRANCH_MANAGER", "SALES", "OPERATIONS"), BookingController.getAvailability);
router.get("/:id", authorize("OWNER", "BRANCH_MANAGER", "SALES", "OPERATIONS"), BookingController.getById);
router.post("/", authorize("OWNER", "BRANCH_MANAGER", "SALES"), validate(createBookingSchema), BookingController.create);
router.patch("/:id", authorize("OWNER", "BRANCH_MANAGER", "SALES"), validate(updateBookingSchema), BookingController.update);

export default router;
