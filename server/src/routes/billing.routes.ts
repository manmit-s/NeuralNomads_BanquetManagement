import { Router } from "express";
import { BillingController } from "../controllers/billing.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { branchIsolation } from "../middleware/branchIsolation.js";
import { validate } from "../middleware/validate.js";
import { createInvoiceSchema, createPaymentSchema } from "../validators/schemas.js";

const router = Router();

router.use(authenticate, branchIsolation);

// Invoices
router.get("/invoices", authorize("OWNER", "BRANCH_MANAGER", "SALES"), BillingController.getAllInvoices);
router.get("/invoices/outstanding", authorize("OWNER", "BRANCH_MANAGER"), BillingController.getOutstanding);
router.get("/invoices/:id", authorize("OWNER", "BRANCH_MANAGER", "SALES"), BillingController.getInvoice);
router.post("/invoices", authorize("OWNER", "BRANCH_MANAGER"), validate(createInvoiceSchema), BillingController.createInvoice);

// Payments
router.post("/payments", authorize("OWNER", "BRANCH_MANAGER"), validate(createPaymentSchema), BillingController.recordPayment);

export default router;
