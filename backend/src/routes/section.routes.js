import { Router } from "express";
import {
    getCourseSections,
    getSectionById
} from "../controllers/section.controller.js";

const router = Router();

router.route("/courses/:courseId/sections").get(getCourseSections);
router.route("/sections/:sectionId").get(getSectionById);

export default router;
