import mongoose, { Schema } from "mongoose";

const quizQuestionSchema = new Schema(
  {
    quizId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Quiz",
      required: true
    },
    question: {
      type: String,
      required: true
    },
    options: [
      {
        text: String,
        isCorrect: Boolean
      }
    ],
    order: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

export const QuizQuestion = mongoose.model("QuizQuestion", quizQuestionSchema);
