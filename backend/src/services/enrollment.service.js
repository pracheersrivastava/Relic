import { Enrollment } from "../models/enrollment.model.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Convert purchased courses into enrollments
 */
export const createEnrollmentsFromOrder = async (order) => {
    if (!order || !order.items?.length) {
        throw new ApiError(400, "Invalid order");
    }

    const enrollments = order.items.map(item => ({
        userId: order.userId,
        courseId: item.courseId,
        orderId: order._id
    }));

    /**
     * ordered: false
     * → even if one enrollment already exists,
     *   others will still be inserted
     */
    await Enrollment.insertMany(enrollments, {
        ordered: false
    });
};
