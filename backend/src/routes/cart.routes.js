import { Router } from "express";
import {
    addToCart,
    getMyCart,
    removeFromCart,
    clearCart,
    payCart
} from "../controllers/cart.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Get current user's cart
router.get("/", verifyJWT, getMyCart);

// Add course to cart
router.post("/add", verifyJWT, addToCart);

// Remove course from cart
router.delete("/remove/:courseId", verifyJWT, removeFromCart);

// Clear cart
router.delete("/clear", verifyJWT, clearCart);

// Pay for cart (creates order and enrollments)
router.post("/pay", verifyJWT, payCart);

export default router;
