import { Router } from "express";
import {
    getSectionLessons,
    getLessonsById,
    markLessonCompleted,
    getNextLesson,
    markLessonProgress,
    getCompletedLessonsOfSection
} from "controllers/lesson.controller.js";
import {
    getCourseSections,
    getSectionById
} from "../controllers/section.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

// Protected route

router.route("sections/:sectionId/lessons").get(verifyJWT,getSectionLessons);