import { Router } from "express";
import {
    getAllCourses,
    getEnrolledCourses
} from "../controllers/course.controller.js";
import {registerReview, getUserReview, recalculateAllRatings} from "../controllers/reviews.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";
const router = Router();

// Public route - no auth required
router.get("/all-courses", getAllCourses);
// Recalculate all ratings (one-time utility)
router.post("/recalculate-ratings", recalculateAllRatings);
// Protected route - requires auth
router.get("/my-courses", verifyJWT, getEnrolledCourses)
router.post("/my-courses/:courseId/review", verifyJWT, registerReview);
router.get("/my-courses/:courseId/review", verifyJWT, getUserReview);
export default router;