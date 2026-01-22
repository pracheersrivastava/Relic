// quiz.model.js
import mongoose, { Schema } from "mongoose";

const quizSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      default: "general", // future-proofing
      index: true
    },
    passingScore: {
      type: Number,
      default: 70 // percentage
    },
    timeLimit: {
      type: Number // in minutes , most of the times no time limit
    },
    isPublic: {
      type: Boolean,
      default: true // general quizzes are public
    }
  },
  { timestamps: true }
);

export const Quiz = mongoose.model("Quiz", quizSchema);
