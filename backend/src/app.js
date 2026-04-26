import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from 'express-rate-limit';
import userRouter from "./routes/user.routes.js";
import courseRouter from "./routes/courses.routes.js";
import cartRouter from "./routes/cart.routes.js";
import sectionRouter from "./routes/section.routes.js";
import lessonRouter from "./routes/lessson.routes.js";
import dashboardRouter from "./routes/dashboardboard.routes.js";

const app = express();

const limiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-8',
})

app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:3003'
    ],
    credentials: true
}));
app.use(express.json({ limit: '64kb' })); //setting JSON limit
app.use(express.urlencoded({ extended: true, limit: "64kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(limiter);
//routes

app.use("/api/v1/users", userRouter);
app.use("/api/v1/courses", courseRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/section", sectionRouter);
app.use("/api/v1/lessons", lessonRouter);
app.use("/api/v1/dashboard", dashboardRouter);

// Health check endpoint
app.get("/api/v1/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "Backend is running" });
});

// Root endpoint
app.get("/", (req, res) => {
    res.status(200).json({ status: "ok", message: "Relic API" });
});

app.use((err, req, res, next) => {
    const statusCode = err?.statusCode || 500;

    res.status(statusCode).json({
        statusCode,
        data: null,
        message: err?.message || "Internal server error",
        success: false,
        errors: err?.errors || [],
    });
});

export { app };
