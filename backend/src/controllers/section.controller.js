import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { Section } from "../models/section.model.js";
import { Course } from "../models/course.model.js";

// for fetching all sections of a course
const getCourseSections = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    const course = await Course.findOne({ _id: courseId });
    if (!course) {
        throw new ApiError(404, "Course not found");
    }
    const sections = await Section.find({ courseId })
        .sort({ order: 1 })
        .select("-__v");

    // Return empty array if no sections (don't throw error)
    return res.status(200).json(
        new ApiResponce(
            200,
            sections,
            sections.length ? "Course sections fetched successfully" : "No sections found for this course"
        )
    );
});
//For fetiching single section by id
const getSectionById = asyncHandler(async (req, res) => {
    const { sectionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sectionId)) {
        throw new ApiError(400, "Invalid section id");
    }

    const section = await Section.findById(sectionId).select("-__v");

    if (!section) {
        throw new ApiError(404, "Section not found");
    }

    return res.status(200).json(
        new ApiResponce(
            200,
            section,
            "Section fetched successfully"
        )
    );
});

export {
    getCourseSections,
    getSectionById,
};