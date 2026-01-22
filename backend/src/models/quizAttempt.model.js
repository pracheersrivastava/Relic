import mongoose, { Schema } from "mongoose";

const quizAttemptSchema = new Schema(
  {
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: false
    },
    quizId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Quiz",
      required: true
    },
    score: {
      type: Number,
      required: true
    },
    passed: {
      type: Boolean,
      required: true
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    answers: [
      {
        questionId: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: "QuizQuestion"
        },
        selectedOptionIndex: Number,
        isCorrect: Boolean,
      }
    ],
    attemptedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export const QuizAttempt = mongoose.model(
  "QuizAttempt",
  quizAttemptSchema
);
