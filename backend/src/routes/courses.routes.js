import { Router } from "express";
import {
    getAllCourses
} from "../controllers/course.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";
const router = Router();

router.get("/all-courses",verifyJWT,getAllCourses);

export default router;