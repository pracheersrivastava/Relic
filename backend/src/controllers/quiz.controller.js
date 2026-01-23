import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";

import { Quiz } from "../models/quiz.model.js";
import { QuizQuestion } from "../models/quizQuestion.model.js";
import { QuizAttempt } from "../models/quizAttempt.model.js";
import { Enrollment } from "../models/enrollment.model.js";


const QUESTION_LIMIT = 20;

const getQuiz = asyncHandler(async (req, res) => {
  const { quizId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(quizId)) {
    throw new ApiError(400, "Invalid quiz id");
  }

  let quiz = await Quiz.findById(quizId).select("-__v");

  // Auto-create or update quiz with correct name
  if (!quiz) {
    quiz = await Quiz.create({
      _id: new mongoose.Types.ObjectId(quizId),
      title: "CDL Practice Test",
      category: "Trucking",
      passingScore: 70,
      timeLimit: 30,
      isPublic: true
    });
  } else if (quiz.title !== "CDL Practice Test") {
    // Update existing quiz with correct name
    quiz.title = "CDL Practice Test";
    quiz.category = "Trucking";
    await quiz.save();
  }

  // Fetch random questions from all available questions
  const questions = await QuizQuestion.aggregate([
    { $sample: { size: QUESTION_LIMIT } }
  ]);

  // Require at least 5 questions to run a quiz
  if (questions.length < 5) {
    throw new ApiError(400, "Not enough questions in database (minimum 5 required)");
  }

  // Include explanation and isCorrect for instant feedback on frontend
  const sanitizedQuestions = questions.map(q => ({
    _id: q._id,
    question: q.question,
    explanation: q.explanation || '',
    options: q.options.map(o => ({ text: o.text, isCorrect: o.isCorrect }))
  }));

  return res.status(200).json(
    new ApiResponce(
      200,
      { quiz, questions: sanitizedQuestions },
      "Quiz fetched successfully"
    )
  );
});

const submitQuiz = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const { answers } = req.body;

  if (!Array.isArray(answers) || answers.length === 0) {
    throw new ApiError(400, "Answers are required");
  }

  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    throw new ApiError(404, "Quiz not found");
  }

  const questionIds = answers.map(a => a.questionId);

  const questions = await QuizQuestion.find({
    _id: { $in: questionIds }
  });

  let correctCount = 0;

  for (const ans of answers) {
    const question = questions.find(q =>
      q._id.equals(ans.questionId)
    );

    if (!question) continue;

    const selected =
      question.options?.[ans.selectedOptionIndex];

    if (selected?.isCorrect) {
      correctCount++;
    }
  }

  const score = Math.round(
    (correctCount / questions.length) * 100
  );

  const passed = score >= quiz.passingScore;

  /** 🔐 SAVE ONLY IF LOGGED IN */
  if (req.user?._id) {
    const existingAttempt = await QuizAttempt.findOne({
      userId: req.user._id,
      quizId
    });

    if (!existingAttempt) {
      await QuizAttempt.create({
        userId: req.user._id,
        quizId,
        score,
        passed,
        percentage: score,
        answers
      });
    }
  }

  return res.status(200).json(
    new ApiResponce(
      200,
      {
        score,
        passed,
        correct: correctCount,
        total: questions.length,
        saved: Boolean(req.user?._id)
      },
      "Quiz submitted successfully"
    )
  );
});

const getMyQuizResult = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw new ApiError(401, "Login required");
  }

  const { quizId } = req.params;

  const attempt = await QuizAttempt.findOne({
    userId: req.user._id,
    quizId
  });

  if (!attempt) {
    throw new ApiError(404, "No saved attempt found");
  }

  return res.status(200).json(
    new ApiResponce(
      200,
      attempt,
      "Quiz result fetched"
    )
  );
});

export {
  getQuiz,
  submitQuiz,
  getMyQuizResult
};