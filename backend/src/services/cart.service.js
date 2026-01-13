import { Cart } from "../models/cart.model.js";
import { Course } from "../models/course.model.js";
import { Enrollment } from "../models/enrollment.model.js";
import { Order } from "../models/order.model.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Add a course to cart
 */
export const addToCart = async (userId, courseId) => {
    // Check course exists
    const course = await Course.findById(courseId);
    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    // Prevent adding already enrolled course
    const alreadyEnrolled = await Enrollment.findOne({
        userId,
        courseId
    });

    if (alreadyEnrolled) {
        throw new ApiError(400, "Course already enrolled");
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
        cart = await Cart.create({
            userId,
            items: [{ courseId, price: course.price || 1 }]
        });
        return cart;
    }

    // Prevent duplicate cart items
    const alreadyInCart = cart.items.some(
        item => item.courseId.toString() === courseId.toString()
    );

    if (alreadyInCart) {
        throw new ApiError(400, "Course already in cart");
    }

    cart.items.push({ courseId, price: course.price || 1 });
    await cart.save();

    return cart;
};

/**
 * Get user's cart with populated courses
 */
export const getUserCart = async (userId) => {
    const cart = await Cart.findOne({ userId })
        .populate("items.courseId");

    if (!cart) {
        return {
            items: [],
            totalPrice: 0
        };
    }

    const totalPrice = cart.items.reduce(
        (sum, item) => sum + (item.courseId?.price || item.price || 1),
        0
    );

    return {
        cartId: cart._id,
        items: cart.items,
        totalPrice
    };
};

/**
 * Remove a course from cart
 */
export const removeFromCart = async (userId, courseId) => {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    cart.items = cart.items.filter(
        item => item.courseId.toString() !== courseId.toString()
    );

    await cart.save();
    return cart;
};

/**
 * Clear cart
 */
export const clearCart = async (userId) => {
    await Cart.deleteOne({ userId });
};

/**
 * Mock checkout (NO real payment)
 */
export const mockCheckout = async (userId) => {
    const cart = await Cart.findOne({ userId })
        .populate("items.courseId");

    if (!cart || cart.items.length === 0) {
        throw new ApiError(400, "Cart is empty");
    }

    // Prevent purchasing already enrolled courses
    const enrolledCourses = await Enrollment.find({
        userId,
        courseId: { $in: cart.items.map(i => i.courseId._id) }
    });

    if (enrolledCourses.length > 0) {
        throw new ApiError(
            400,
            "One or more courses already enrolled"
        );
    }

    // Prepare order items
    const items = cart.items.map(item => ({
        courseId: item.courseId._id,
        priceAtPurchase: item.courseId.price
    }));

    const totalAmount = items.reduce(
        (sum, item) => sum + item.priceAtPurchase,
        0
    );

    // Create order (mock paid)
    const order = await Order.create({
        userId,
        items,
        totalAmount,
        paymentStatus: "paid"
    });
    await createEnrollmentsFromOrder(order);
    
    // Create enrollments
    await Enrollment.insertMany(
        items.map(item => ({
            userId,
            courseId: item.courseId,
            orderId: order._id
        })),
        { ordered: false }
    );

    // Clear cart
    await Cart.deleteOne({ userId });

    return order;
};
