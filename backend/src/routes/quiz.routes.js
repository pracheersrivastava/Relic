import {Router} from "express";
import {
    getQuizBySection,
    submitQuiz,
    getMyQuizResult
} from "../controllers/quiz.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//Protected Routes
router.route("sections/:sectionId/quiz").get(verifyJWT,getQuizBySection);
router.route("sections/:sectionId/quiz").post(verifyJWT,submitQuiz);
router.route("sections/:sectionId/quiz/result").get(verifyJWT,getMyQuizResult);

export default router;