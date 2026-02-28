import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { signUpSchema, signInSchema } from "../validators/schemas.js";

const router = Router();

router.post("/signup", validate(signUpSchema), AuthController.signUp);
router.post("/signin", validate(signInSchema), AuthController.signIn);
router.get("/profile", authenticate, AuthController.getProfile);

export default router;
