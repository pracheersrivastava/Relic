// quiz.model.js
import mongoose, { Schema } from "mongoose";

const quizSchema = new Schema(
  {
    sectionId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Section",
      required: true,
      unique: true // one quiz per section
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    passingScore: {
      type: Number,
      default: 60 // percentage
    },
    timeLimit: {
      type: Number // in minutes , most of the times no time limit
    }
  },
  { timestamps: true }
);

export const Quiz = mongoose.model("Quiz", quizSchema);
