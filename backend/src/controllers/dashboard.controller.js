import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import QuizAttempt from "../models/quizAttempt.model.js";
import Course from "../models/course.model.js";

const getDashboardStats = asyncHandler(async (req,res)=>{
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalQuizAtempts = await QuizAttempt.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalRevenueData = await Order.aggregate([
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$totalPrice" }
            }
        }
    ]);
    const totalRevenue = totalRevenueData[0] ? totalRevenueData[0].totalRevenue : 0;

    if (!totalUsers || !totalOrders || !totalQuizAtempts || !totalCourses) {
        throw new ApiError(404, "No statistics found");
    }
    
    return res.status(200).json(
    new ApiResponce(
        200,
        { totalUsers, totalCourses, totalOrders, totalQuizAtempts, totalRevenue },
        "DashBoard statistics fetched successfully"
    )
    );
});

export { 
    getDashboardStats
};