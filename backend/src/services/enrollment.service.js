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

    try {
        /**
         * ordered: false
         * → even if one enrollment already exists,
         *   others will still be inserted
         */
        await Enrollment.insertMany(enrollments, {
            ordered: false
        });
    } catch (error) {
        // Ignore duplicate key errors (user already enrolled)
        // This can happen if the same payment is confirmed twice
        // or if user was previously enrolled
        if (error.code !== 11000 && !error.message?.includes('duplicate key')) {
            throw error;
        }
        // Log but don't fail for duplicates
        console.log('Some enrollments already exist, skipping duplicates');
    }
};

