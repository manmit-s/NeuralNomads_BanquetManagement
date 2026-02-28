import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "./config/index.js";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// ── Security ──
app.use(helmet());
app.use(cors({
    origin: config.clientUrl,
    credentials: true,
}));

// ── Rate limiting ──
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    message: { success: false, error: "Too many requests, please try again later" },
}));

// ── Body parsing ──
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── API Routes ──
app.use("/api/v1", routes);

// ── 404 handler ──
app.use((_req, res) => {
    res.status(404).json({ success: false, error: "Route not found" });
});

// ── Global error handler ──
app.use(errorHandler);

export default app;
