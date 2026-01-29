import mongoose from "mongoose";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponce} from "../utils/ApiResponce.js";
import {Course} from "../models/course.model.js";
import { Enrollment } from "../models/enrollment.model.js";
import { Section } from "../models/section.model.js";
import { Lesson } from "../models/lesson.model.js";
import { LessonProgress } from "../models/lessonProgress.model.js";

const getAllCourses = asyncHandler(async(req,res)=>{
    //fetch all courses from the data base
    // return them as a list in response
    const courses = await Course.find({});

    if(courses.length===0){
        throw new ApiError(404,"No courses found");
    }

    return res
    .status(200)
    .json(new ApiResponce(200,courses,"All courses fetched successfully"));
});

const getEnrolledCourses = asyncHandler(async(req,res)=>{
    //fetch all purcheshed courses of user from database
    // return them as a list in response
    const userId = req.user._id;
    const courses = await Enrollment.aggregate([
        {
            $match: {userId},
        },
        {
            $lookup: {
                from: "courses",
                localField: "courseId",
                foreignField: "_id",
                as: "course"
            }
        },
        { $unwind: "$course" },
        {
            $replaceRoot: { newRoot: "$course" }
        }      
    ]);
    if (!courses.length) {
        throw new ApiError(404, "No enrolled courses found");
    }

    return res
        .status(200)
        .json(new ApiResponce(200, courses, "Enrolled courses fetched"));
});

// Get enrolled courses with aggregated progress information
const getEnrolledCoursesWithProgress = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const enrollments = await Enrollment.find({ userId }).select("courseId");
    if (!enrollments.length) {
        throw new ApiError(404, "No enrolled courses found");
    }

    const courseIds = enrollments.map((e) => e.courseId);

    const courses = await Course.find({ _id: { $in: courseIds } }).lean();
    if (!courses.length) {
        throw new ApiError(404, "No courses found");
    }

    const sections = await Section.find({
        courseId: { $in: courseIds },
    }).select("_id courseId");

    const sectionIds = sections.map((s) => s._id);

    const lessons = await Lesson.find({
        sectionId: { $in: sectionIds },
    }).select("_id sectionId");

    const lessonIds = lessons.map((l) => l._id);

    const completedProgress = await LessonProgress.find({
        userId,
        lessonId: { $in: lessonIds },
        completed: true,
    }).select("lessonId");

    const completedLessonIds = new Set(
        completedProgress.map((p) => p.lessonId.toString())
    );

    const courseStats = new Map();

    const sectionCourseMap = new Map(
        sections.map((s) => [s._id.toString(), s.courseId.toString()])
    );

    lessons.forEach((lesson) => {
        const sectionId = lesson.sectionId.toString();
        const courseId = sectionCourseMap.get(sectionId);
        if (!courseId) return;

        if (!courseStats.has(courseId)) {
            courseStats.set(courseId, {
                totalLessons: 0,
                completedLessons: 0,
            });
        }

        const stats = courseStats.get(courseId);
        stats.totalLessons += 1;
        if (completedLessonIds.has(lesson._id.toString())) {
            stats.completedLessons += 1;
        }
    });

    const result = courses.map((course) => {
        const stats = courseStats.get(course._id.toString()) || {
            totalLessons: 0,
            completedLessons: 0,
        };

        const progress =
            stats.totalLessons > 0
                ? Math.round((stats.completedLessons / stats.totalLessons) * 100)
                : 0;

        return {
            ...course,
            progress,
            totalLessons: stats.totalLessons,
            completedLessons: stats.completedLessons,
        };
    });

    return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                result,
                "Enrolled courses with progress fetched successfully"
            )
        );
});

// Get full learning data for a specific course (sections, lessons, completed lessons)
const getCourseLearningData = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
        throw new ApiError(400, "Invalid course id");
    }

    const enrollment = await Enrollment.findOne({
        userId,
        courseId,
    });

    if (!enrollment) {
        throw new ApiError(403, "You are not enrolled in this course");
    }

    const course = await Course.findById(courseId).lean();
    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    const sections = await Section.find({ courseId })
        .sort({ order: 1 })
        .lean();

    const sectionIds = sections.map((s) => s._id);

    const lessons = await Lesson.find({
        sectionId: { $in: sectionIds },
    })
        .sort({ order: 1 })
        .lean();

    const lessonIds = lessons.map((l) => l._id);

    const completedProgress = await LessonProgress.find({
        userId,
        lessonId: { $in: lessonIds },
        completed: true,
    }).select("lessonId");

    const completedLessonIds = completedProgress.map((p) =>
        p.lessonId.toString()
    );

    const lessonsBySection = new Map();
    lessons.forEach((lesson) => {
        const key = lesson.sectionId.toString();
        if (!lessonsBySection.has(key)) {
            lessonsBySection.set(key, []);
        }
        lessonsBySection.get(key).push(lesson);
    });

    const sectionsWithLessons = sections.map((section) => ({
        _id: section._id,
        title: section.title,
        courseId: section.courseId,
        order: section.order,
        lessons: (lessonsBySection.get(section._id.toString()) || []).map(
            (lesson) => ({
                _id: lesson._id,
                title: lesson.title,
                duration: lesson.duration,
                videoUrl: lesson.videoUrl,
                sectionId: lesson.sectionId,
                order: lesson.order,
            })
        ),
    }));

    return res.status(200).json(
        new ApiResponce(
            200,
            {
                course,
                sections: sectionsWithLessons,
                completedLessonIds,
            },
            "Course learning data fetched successfully"
        )
    );
});

export {
    getAllCourses,
    getEnrolledCourses,
    getEnrolledCoursesWithProgress,
    getCourseLearningData
}