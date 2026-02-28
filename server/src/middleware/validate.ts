import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { ValidationError } from "../utils/errors.js";

/**
 * Validate request body / query / params against a Zod schema.
 *
 * Usage:
 *   router.post("/leads", validate(createLeadSchema), leadsController.create);
 */
export function validate(schema: ZodSchema, source: "body" | "query" | "params" = "body") {
    return (req: Request, _res: Response, next: NextFunction) => {
        const result = schema.safeParse(req[source]);

        if (!result.success) {
            const messages = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
            return next(new ValidationError(messages.join("; ")));
        }

        // Replace with parsed data (includes transforms & defaults)
        req[source] = result.data;
        next();
    };
}
