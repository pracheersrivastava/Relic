import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";

import { Quiz } from "../models/quiz.model.js";
import { QuizQuestion } from "../models/quizQuestion.model.js";
import { QuizAttempt } from "../models/quizAttempt.model.js";
import { Enrollment } from "../models/enrollment.model.js";

const getQuizBySection = asyncHandler(async (req, res) => {
  const { sectionId } = req.params;

  const quiz = await Quiz.findOne({ sectionId });
  if (!quiz) {
    throw new ApiError(404, "Quiz not found");
  }

  const questions = await QuizQuestion.find({ quizId: quiz._id })
    .select("-options.isCorrect")
    .sort({ order: 1 });

  return res.status(200).json(
    new ApiResponce(200, { quiz, questions }, "Quiz fetched successfully")
  );
});

const submitQuiz = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const { answers } = req.body;
  const userId = req.user._id;

  if (!answers?.length) {
    throw new ApiError(400, "Answers are required");
  }

  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    throw new ApiError(404, "Quiz not found");
  }

  // check enrollment via section → course
  const enrollment = await Enrollment.findOne({
    userId
  });

  if (!enrollment) {
    throw new ApiError(403, "You must be enrolled to attempt this quiz");
  }

  const existingAttempt = await QuizAttempt.findOne({
    userId,
    quizId
  });

  if (existingAttempt) {
    throw new ApiError(409, "Quiz already attempted");
  }

  const questions = await QuizQuestion.find({ quizId });

  let correctCount = 0;

  answers.forEach(ans => {
    const question = questions.find(q =>
      q._id.equals(ans.questionId)
    );

    if (!question) return;

    const selected = question.options[ans.selectedOptionIndex];
    if (selected?.isCorrect) {
      correctCount++;
    }
  });

  const percentage =
    (correctCount / questions.length) * 100;

  const passed = percentage >= quiz.passingScore;

  const attempt = await QuizAttempt.create({
    userId,
    quizId,
    score: percentage,
    passed,
    answers
  });

  return res.status(200).json(
    new ApiResponce(200, attempt, "Quiz submitted successfully")
  );
});


const getMyQuizResult = asyncHandler(async (req, res) => {
  const { quizId } = req.params;

  const attempt = await QuizAttempt.findOne({
    userId: req.user._id,
    quizId
  });

  if (!attempt) {
    throw new ApiError(404, "Quiz not attempted yet");
  }

  return res.status(200).json(
    new ApiResponce(200, attempt, "Quiz result fetched")
  );
});

export {
    getQuizBySection,
    submitQuiz,
    getMyQuizResult
};