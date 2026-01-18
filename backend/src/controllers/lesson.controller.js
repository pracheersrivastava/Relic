import mongoose from "mongoose";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponce} from "../utils/ApiResponce.js";
import {Lesson} from "../models/lesson.model.js";
import { Section} from "../models/section.model.js";

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
});

//to mark out lesson as done
const markLessonCompleted = asyncHandler(async(req,res)=>{
});

//move to next lesson
const getNextLesson = asyncHandler(async(req,res)=>{
});

//get progess
const markLessonProgress = asyncHandler(async(req,res)=>{
});

const getCompletedLessonsOfSection = asyncHandler(async(req,res)=>{
});
export{
    getSectionLessons,
    getLessonsById,
    markLessonCompleted,
    getNextLesson,
    markLessonProgress,
    getCompletedLessonsOfSection
};