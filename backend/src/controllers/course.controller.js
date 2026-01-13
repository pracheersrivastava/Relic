import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponce} from "../utils/ApiResponce.js";
import {Course} from "../models/course.model.js";
import { Enrollment } from "../models/enrollment.model.js";

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

export {
    getAllCourses,
    getEnrolledCourses
}