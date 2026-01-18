import mongoose from "mongoose";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponce} from "../utils/ApiResponce.js";
import {Lesson} from "../models/lesson.model.js";
import { Section} from "../models/section.model.js";
import {LessonProgress} from "../models/lessonProgress.model.js"

// for fetching all lessons of a section
const getSectionLessons = asyncHandler(async(req,res)=>{
    const {sectionId} = req.params;
    if (!mongoose.Types.ObjectId.isValid(sectionId)) {
        throw new ApiError(400, "Invalid section id");
    }

    const lessons = await Lesson.find({ sectionId })
        .sort({ order: 1 })
        .select("-__v");

    if (!lessons.length) {
        throw new ApiError(404, "No lessons found for this section");
    }

    return res.status(200).json(
        new ApiResponce(
            200,
            lessons,
            "Lessons fetched successfully"
        )
    );
});

// for fetching the lesson by it's unique id
const getLessonsById = asyncHandler(async(req,res)=>{
    const { lessonId } = req.params;
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
        throw new ApiError(400, "Invalid lesson id");
    }

    const lesson = await Lesson.findById(lessonId).select("-__v");

    if (!lesson) {
        throw new ApiError(404, "Lesson not found");
    }

    // find section to get courseId
    const section = await Section.findById(lesson.sectionId).select("courseId");

    if (!section) {
        throw new ApiError(404, "Section not found");
    }

    // check enrollment
    const isEnrolled = await Enrollment.findOne({
        userId,
        courseId: section.courseId,
    });

    if (!isEnrolled) {
        throw new ApiError(403, "You are not enrolled in this course");
    }

    return res.status(200).json(
        new ApiResponce(
            200,
            lesson,
            "Lesson fetched successfully"
        )
    );
});

//to mark out lesson as done
const markLessonCompleted = asyncHandler(async(req,res)=>{
    const { lessonId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
        throw new ApiError(400, "Invalid lesson id");
    }

    await LessonProgress.findOneAndUpdate(
        { userId, lessonId },
        {
            $set: {
                completed: true,
                progress: 100,
                completedAt: new Date(),
            },
        },
        { upsert: true, new: true }
    );

    return res.status(200).json(
        new ApiResponce(200, null, "Lesson marked as completed")
    );
});

//move to next lesson
const getNextLesson = asyncHandler(async(req,res)=>{
    const { lessonId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
        throw new ApiError(400, "Invalid lesson id");
    }

    const currentLesson = await Lesson.findById(lessonId);

    if (!currentLesson) {
        throw new ApiError(404, "Lesson not found");
    }

    const nextLesson = await Lesson.findOne({
        sectionId: currentLesson.sectionId,
        order: { $gt: currentLesson.order },
    })
        .sort({ order: 1 })
        .select("-__v");

    if (!nextLesson) {
        throw new ApiError(404, "No next lesson found");
    }

    return res.status(200).json(
        new ApiResponce(200, nextLesson, "Next lesson fetched")
    );
});

//get progess
const markLessonProgress = asyncHandler(async(req,res)=>{
    const { lessonId } = req.params;
    const { progress } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
        throw new ApiError(400, "Invalid lesson id");
    }

    if (progress < 0 || progress > 100) {
        throw new ApiError(400, "Progress must be between 0 and 100");
    }

    const updated = await LessonProgress.findOneAndUpdate(
        { userId, lessonId },
        {
            $set: {
                progress,
                completed: progress === 100,
                completedAt: progress === 100 ? new Date() : null,
            },
        },
        { upsert: true, new: true }
    );

    return res.status(200).json(
        new ApiResponce(200, updated, "Lesson progress updated")
    );
});

const getCompletedLessonsOfSection = asyncHandler(async(req,res)=>{
    const { sectionId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(sectionId)) {
        throw new ApiError(400, "Invalid section id");
    }

    const lessons = await Lesson.find({ sectionId }).select("_id");

    if (!lessons.length) {
        return res.status(200).json(
            new ApiResponce(200, [], "No lessons in this section")
        );
    }

    const lessonIds = lessons.map((l) => l._id);

    const completed = await LessonProgress.find({
        userId,
        lessonId: { $in: lessonIds },
        completed: true,
    }).select("lessonId -_id");

    return res.status(200).json(
        new ApiResponce(
            200,
            completed.map((c) => c.lessonId),
            "Completed lessons fetched"
        )
    );
});
export{
    getSectionLessons,
    getLessonsById,
    markLessonCompleted,
    getNextLesson,
    markLessonProgress,
    getCompletedLessonsOfSection
};