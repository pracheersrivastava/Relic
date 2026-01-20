import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { Review } from "../models/review.model.js";
import { Enrollment } from "../models/enrollment.model.js";
import { Course } from "../models/course.model.js";

const registerReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const { courseId } = req.params;
    const userId = req.user._id;

    if (!rating || rating < 1 || rating > 5) {
        throw new ApiError(400, "Rating must be between 1 and 5");
    }

    // Convert courseId string to ObjectId for queries
    const courseObjectId = new mongoose.Types.ObjectId(courseId);

    const isEnrolled = await Enrollment.findOne({
        userId,
        courseId: courseObjectId,
    });

    if (!isEnrolled) {
        throw new ApiError(403, "You must be enrolled to review this course");
    }

    const existingReview = await Review.findOne({
        userId,
        courseId: courseObjectId,
    });

    if (existingReview) {
        throw new ApiError(409, "You have already reviewed this course");
    }

    const review = await Review.create({
        userId,
        courseId: courseObjectId,
        rating,
        comment,
    });

    // Aggregate to calculate average rating and total reviews
    const stats = await Review.aggregate([
        { $match: { courseId: courseObjectId } },
        {
            $group: {
                _id: "$courseId",
                avgRating: { $avg: "$rating" },
                totalReviews: { $sum: 1 },
            },
        },
    ]);

    if (stats.length) {
        await Course.findByIdAndUpdate(courseId, {
            averageRating: Math.round(stats[0].avgRating * 10) / 10, // Round to 1 decimal
            totalReviews: stats[0].totalReviews,
        });
    }

    return res.status(201).json(
        new ApiResponce(201, review, "Review submitted successfully")
    );
});

// Get user's review for a course
const getUserReview = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const userId = req.user._id;

    // Convert courseId string to ObjectId
    const courseObjectId = new mongoose.Types.ObjectId(courseId);

    const review = await Review.findOne({
        userId,
        courseId: courseObjectId,
    });

    if (!review) {
        return res.status(200).json(
            new ApiResponce(200, null, "No review found")
        );
    }

    return res.status(200).json(
        new ApiResponce(200, review, "Review fetched successfully")
    );
});

// Recalculate all course ratings from existing reviews
const recalculateAllRatings = asyncHandler(async (req, res) => {
    // Get all courses
    const courses = await Course.find({});

    let updatedCount = 0;

    for (const course of courses) {
        const stats = await Review.aggregate([
            { $match: { courseId: course._id } },
            {
                $group: {
                    _id: "$courseId",
                    avgRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 },
                },
            },
        ]);

        if (stats.length) {
            await Course.findByIdAndUpdate(course._id, {
                averageRating: Math.round(stats[0].avgRating * 10) / 10,
                totalReviews: stats[0].totalReviews,
            });
            updatedCount++;
        } else {
            // Reset to 0 if no reviews
            await Course.findByIdAndUpdate(course._id, {
                averageRating: 0,
                totalReviews: 0,
            });
        }
    }

    return res.status(200).json(
        new ApiResponce(200, { updatedCourses: updatedCount }, "All course ratings recalculated")
    );
});

const reviewEdit = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const userId = req.user._id;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        throw new ApiError(400, "Rating must be between 1 and 5");
    }

    // Convert courseId string to ObjectId
    const courseObjectId = new mongoose.Types.ObjectId(courseId);

    const review = await Review.findOne({
        userId,
        courseId: courseObjectId,
    });

    if (!review) {
        throw new ApiError(404, "Review not found");
    }

    // Update the review
    const updatedReview = await Review.findByIdAndUpdate(
        review._id,
        { rating, comment },
        { new: true }
    );

    // Recalculate average rating and total reviews
    const stats = await Review.aggregate([
        { $match: { courseId: courseObjectId } },
        {
            $group: {
                _id: "$courseId",
                avgRating: { $avg: "$rating" },
                totalReviews: { $sum: 1 },
            },
        },
    ]);

    if (stats.length) {
        await Course.findByIdAndUpdate(courseId, {
            averageRating: Math.round(stats[0].avgRating * 10) / 10,
            totalReviews: stats[0].totalReviews,
        });
    }

    return res.status(200).json(
        new ApiResponce(200, updatedReview, "Review updated successfully")
    );
});

export {
    registerReview,
    getUserReview,
    recalculateAllRatings,
    reviewEdit,
};