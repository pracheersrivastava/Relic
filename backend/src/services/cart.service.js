import { Cart } from "../models/cart.model.js";
import { Course } from "../models/course.model.js";
import { Enrollment } from "../models/enrollment.model.js";
import { Order } from "../models/order.model.js";
import { ApiError } from "../utils/ApiError.js";
import { createEnrollmentsFromOrder } from "./enrollment.service.js";
import Stripe from "stripe";
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
        // Return populated cart
        return getUserCart(userId);
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

    // Return populated cart
    return getUserCart(userId);
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
    
    // Return populated cart with totalPrice
    return getUserCart(userId);
};

/**
 * Clear cart
 */
export const clearCart = async (userId) => {
    await Cart.deleteOne({ userId });
};

console.log("STRIPE KEY:", process.env.STRIPE_SECRET_KEY);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


export const createPaymentIntent = async (userId) => {
    const cart = await Cart.findOne({ userId })
        .populate("items.courseId");

    if (!cart || cart.items.length === 0) {
        throw new ApiError(400, "Cart is empty");
    }

    const totalAmount = cart.items.reduce(
        (sum, item) => sum + Number(item.courseId.price),
        0
    );

    const amountInCents = Math.round(totalAmount * 100);

    if (amountInCents < 50) {
        throw new ApiError(400, "Minimum amount is $0.50");
    }

    try {
        const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: "usd",
        payment_method_types: ["card"],
        metadata: {
            userId: userId.toString(),
        },
        });

        return paymentIntent;

    } catch (err) {
        console.error("STRIPE ERROR:", err);
        throw new ApiError(500, err.message);
    }
};

