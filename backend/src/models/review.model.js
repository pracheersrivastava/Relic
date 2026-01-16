// review.model.js
import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema(
  {
    courseId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Course",
      required: true
    },
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    comment: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

reviewSchema.index({ courseId: 1, userId: 1 }, { unique: true });

export const Review = mongoose.model("Review", reviewSchema);
