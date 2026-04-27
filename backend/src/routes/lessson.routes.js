import { Router } from "express";
import {
    getSectionLessons,
    getLessonsById,
    markLessonCompleted,
    getNextLesson,
    markLessonProgress,
    getCompletedLessonsOfSection
} from "../controllers/lesson.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { optionalAuth } from "../middlewares/optionalAuth.middleware.js";

const router = Router();

// Public route (lessons list for course preview)

router.route("/sections/:sectionId/lessons").get(optionalAuth, getSectionLessons);
router.route("/:lessonId").get(verifyJWT, getLessonsById);
router.route("/:lessonId/next-lesson").get(verifyJWT, getNextLesson);
router.route("/:lessonId/mark-completed").post(verifyJWT, markLessonCompleted);
router.route("/:lessonId/mark-progress").post(verifyJWT, markLessonProgress);
router.route("/sections/:sectionId/completed-lessons").get(verifyJWT, getCompletedLessonsOfSection);

export default router;