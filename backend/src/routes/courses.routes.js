import { Router } from "express";
import {
    getAllCourses,
    getEnrolledCourses
} from "../controllers/course.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";
const router = Router();

router.get("/all-courses",verifyJWT,getAllCourses);
router.get("/my-courses",verifyJWT,getEnrolledCourses)

export default router;