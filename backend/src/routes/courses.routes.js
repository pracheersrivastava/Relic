import { Router } from "express";
import {
    getAllCourses,
    getEnrolledCourses,
    getEnrolledCoursesWithProgress,
    getCourseLearningData
} from "../controllers/course.controller.js";
import { registerReview, getUserReview, recalculateAllRatings, reviewEdit } from "../controllers/reviews.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

// Public route - no auth required
router.get("/all-courses", getAllCourses);
// Recalculate all ratings (one-time utility)
router.post("/recalculate-ratings", recalculateAllRatings);
// Protected routes - require auth
router.get("/my-courses", verifyJWT, getEnrolledCourses);
router.get("/my-courses-with-progress", verifyJWT, getEnrolledCoursesWithProgress);
router.get("/:courseId/learning-data", verifyJWT, getCourseLearningData);
router.post("/my-courses/:courseId/review", verifyJWT, registerReview);
router.get("/my-courses/:courseId/review", verifyJWT, getUserReview);
router.put("/my-courses/:courseId/review", verifyJWT, reviewEdit);
export default router;