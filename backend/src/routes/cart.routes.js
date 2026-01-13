import { Router } from "express";
import {
    addToCart,
    getMyCart,
    removeFromCart,
    payCart,
    clearCart
} from "../controllers/cart.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = Router();

// Get current user's cart
router.get("/", auth, getMyCart);

// Add course to cart
router.post("/add", auth, addToCart);

// Remove course from cart
router.delete("/remove/:courseId", auth, removeFromCart);

// Mock payment → buy all courses in cart
router.post("/pay", auth, payCart);

// Clear cart
router.delete("/clear", auth, clearCart);

export default router;
