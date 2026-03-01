import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { createMemberSchema, updateMemberSchema } from "../validators/schemas.js";

const router = Router();

// All user-management routes require auth + OWNER role
router.use(authenticate);
router.use(authorize("OWNER"));

router.get("/", UserController.listMembers);
router.post("/", validate(createMemberSchema), UserController.createMember);
router.patch("/:id", validate(updateMemberSchema), UserController.updateMember);

export default router;
