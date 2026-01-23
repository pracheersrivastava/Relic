import {Router} from "express";
import {
    getQuiz,
    submitQuiz,
    getMyQuizResult
} from "../controllers/quiz.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { optionalAuth } from "../middlewares/optionalAuth.middleware.js";

const router = Router();

router.route("/quizzes/:quizId").get(getQuiz);
router.route("/quizzes/:quizId/submit").post(optionalAuth, submitQuiz);
router.route("/quizzes/:quizId/result").get(verifyJWT, getMyQuizResult);

export default router;