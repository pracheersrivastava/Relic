import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponce} from "../utils/ApiResponce.js";
import {Review} from "../models/review.model.js";

const registerReview = asyncHandler(async(req,res)=>{
    const{rating,comment}= req.body;
  const { courseId } = req.params;
  const userId = req.user._id;

  if (!rating || rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  const isEnrolled = await Enrollment.findOne({
    userId,
    courseId,
  });

  if (!isEnrolled) {
    throw new ApiError(403, "You must be enrolled to review this course");
  }

  const existingReview = await Review.findOne({
    userId,
    courseId,
  });

  if (existingReview) {
    throw new ApiError(409, "You have already reviewed this course");
  }

  const review = await Review.create({
    userId,
    courseId,
    rating,
    comment,
  });

  return res.status(201).json(
    new ApiResponce(201, review, "Review submitted successfully")
  );
});

export{
    registerReview,
};