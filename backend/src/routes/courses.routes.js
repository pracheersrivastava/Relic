import { Router } from "express";
import {
    getAllCourses,
    getEnrolledCourses
} from "../controllers/course.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";
const router = Router();

// Public route - no auth required
router.get("/all-courses", getAllCourses);
// Protected route - requires auth
router.get("/my-courses", verifyJWT, getEnrolledCourses)

export default router;