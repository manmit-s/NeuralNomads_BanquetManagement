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
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5177",
        "http://localhost:5178",
        "http://localhost:5179",
        "http://localhost:5180",
        "http://localhost:5181",
        "http://localhost:5182",
    ],
    credentials: true,
}));

// ── Request Logger ──
app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} (${duration}ms)`);
    });
    next();
});

// ── Rate limiting ──
if (config.nodeEnv !== "development") {
    app.use(rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 200,
        message: { success: false, error: "Too many requests, please try again later" },
    }));
}

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
