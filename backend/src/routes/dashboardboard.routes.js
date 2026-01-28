import {
    getDashboardStats
} from "../controllers/dashboard.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/adminAuth.middleware.js";

const router = Router();

// Protected route

router.route("/stats").get(verifyJWT, verifyAdmin, getDashboardStats);

export default router;