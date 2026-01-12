import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponce} from "../utils/ApiResponce.js";
import {Course} from "../models/course.model.js";

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

export {
    getAllCourses,
}