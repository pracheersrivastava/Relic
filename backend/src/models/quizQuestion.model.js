import mongoose, { Schema } from "mongoose";

const quizQuestionSchema = new Schema(
  {
    question: {
      type: String,
      required: true
    },
    options: [
      {
        text: { type: String, required: true },
        isCorrect: { type: Boolean, default: false }
      }
    ],
    explanation: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      index: true,
      default: "Logistics"
    },
  },
  { timestamps: true }
);

export const QuizQuestion = mongoose.model("QuizQuestion", quizQuestionSchema);
