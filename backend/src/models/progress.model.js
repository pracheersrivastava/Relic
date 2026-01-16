// progress.model.js
import mongoose, { Schema } from "mongoose";

const progressSchema = new Schema(
  {
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true
    },
    courseId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Course",
      required: true
    },
    completedLessons: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Lesson"
      }
    ],
    completedQuizzes: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Quiz"
      }
    ],
    completionPercentage: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

progressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const Progress = mongoose.model("Progress", progressSchema);
