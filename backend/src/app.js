import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:3003'
    ],
    credentials: true
}));
app.use(express.json({ limit: '8kb' })); //setting JSON limit
app.use(express.urlencoded({ extended: true, limit: "8kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//routes

import userRouter from "./routes/user.routes.js";
import courseRouter from "./routes/courses.routes.js";
import cartRouter from "./routes/cart.routes.js";
import sectionRouter from "./routes/section.routes.js";
import lessonRouter from "./routes/lessson.routes.js";
import dashboardRouter from "./routes/dashboardboard.routes.js";

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
    res.status(200).json({ status: "ok", message: "Taligent Tech API" });
});

export { app };
