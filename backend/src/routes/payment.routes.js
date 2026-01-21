import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    createPaymentIntent,
    confirmPayment
} from "../controllers/payment.controller.js";

const router = Router();

router.post("/create-intent", verifyJWT, createPaymentIntent);
router.post("/confirm", verifyJWT, confirmPayment);

export default router;
