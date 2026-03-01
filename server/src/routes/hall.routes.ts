import { Router } from "express";
import { HallController } from "../controllers/hall.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { createHallSchema, updateHallSchema } from "../validators/schemas.js";

const router = Router();

router.use(authenticate);

router.get("/", HallController.getByBranch);
router.post("/", authorize("OWNER"), validate(createHallSchema), HallController.create);
router.patch("/:id", authorize("OWNER"), validate(updateHallSchema), HallController.update);
router.delete("/:id", authorize("OWNER"), HallController.deactivate);

export default router;
