import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponce} from "../utils/ApiResponce.js";
import * as cartService from "../services/cart.service.js";

/**
 * Add course to cart
 */
export const addToCart = asyncHandler(async (req, res) => {
    const { courseId } = req.body;

    const cart = await cartService.addToCart(
        req.user._id,
        courseId
    );

    return res.status(200).json(
        new ApiResponce(200, cart, "Course added to cart")
    );
});

/**
 * Get current user's cart
 */
export const getMyCart = asyncHandler(async (req, res) => {
    const cart = await cartService.getUserCart(req.user._id);

    return res.status(200).json(
        new ApiResponce(200, cart, "Cart fetched successfully")
    );
});

/**
 * Remove course from cart
 */
export const removeFromCart = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    const cart = await cartService.removeFromCart(
        req.user._id,
        courseId
    );

    return res.status(200).json(
        new ApiResponce(200, cart, "Course removed from cart")
    );
});

/**
 * Mock payment → buy all courses in cart
 */
export const payCart = asyncHandler(async (req, res) => {
    const order = await cartService.mockCheckout(req.user._id);

    return res.status(200).json(
        new ApiResponce(200, order, "Courses purchased successfully")
    );
});

/**
 * Clear cart manually
 */
export const clearCart = asyncHandler(async (req, res) => {
    await cartService.clearCart(req.user._id);

    return res.status(200).json(
        new ApiResponce(200, null, "Cart cleared")
    );
});
export{
    addToCart,
    getMyCart,
    removeFromCart,
    payCart,
    clearCart,
}