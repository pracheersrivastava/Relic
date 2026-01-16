import mongoose, { Schema } from "mongoose";

const quizAttemptSchema = new Schema(
  {
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true
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
    answers: [
      {
        questionId: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: "QuizQuestion"
        },
        selectedOptionIndex: Number
      }
    ],
    attemptedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

quizAttemptSchema.index({ userId: 1, quizId: 1 });

export const QuizAttempt = mongoose.model(
  "QuizAttempt",
  quizAttemptSchema
);
