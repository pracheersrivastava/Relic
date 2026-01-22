import { stripe } from "../services/stripe.service.js";
import { Cart } from "../models/cart.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Order } from "../models/order.model.js";
import { Enrollment } from "../models/enrollment.model.js";
import { Cart } from "../models/cart.model.js";

const createPaymentIntent = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart || !cart.items.length) {
        throw new ApiError(400, "Cart is empty");
    }

    const totalAmount = cart.items.reduce(
        (sum, item) => sum + item.price,
        0
    );
    const amountInCents = Math.round(totalAmount * 100);

    console.log({
        totalAmount,
        amountInCents,
        type: typeof amountInCents
    });

    const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents, // cents
        currency: "usd",
        automatic_payment_methods: { enabled: true },
        metadata: {
            userId: req.user._id.toString()
        }
    });

    return res.status(200).json(
        new ApiResponce(
            200,
            { clientSecret: paymentIntent.client_secret },
            "Payment intent created"
        )
    );
});

const confirmPayment = asyncHandler(async (req, res) => {
    const { paymentIntentId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId
    );

    if (paymentIntent.status !== "succeeded") {
        throw new ApiError(400, "Payment not successful");
    }

    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    const order = await Order.create({
        userId: req.user._id,
        items: cart.items.map(item => ({
            courseId: item.courseId,
            priceAtPurchase: item.price
        })),
        totalAmount: cart.items.reduce((s, i) => s + i.price, 0),
        paymentStatus: "paid"
    });

    for (const item of cart.items) {
        await Enrollment.create({
            userId: req.user._id,
            courseId: item.courseId,
            orderId: order._id
        });
    }

    await Cart.deleteOne({ userId: req.user._id });

    return res.status(200).json(
        new ApiResponce(200, order, "Payment confirmed & courses enrolled")
    );
});

export { 
    createPaymentIntent,
    confirmPayment,
};
