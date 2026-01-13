import { Router } from "express";
import {
    addToCart,
    getMyCart,
    removeFromCart,
    payCart,
    clearCart
} from "../controllers/cart.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Get current user's cart
router.get("/", verifyJWT, getMyCart);

// Add course to cart
router.post("/add", verifyJWT, addToCart);

// Remove course from cart
router.delete("/remove/:courseId", verifyJWT, removeFromCart);

// Mock payment → buy all courses in cart
router.post("/pay", verifyJWT, payCart);

// Clear cart
router.delete("/clear", verifyJWT, clearCart);

export default router;
