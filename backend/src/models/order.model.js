import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema(
{
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
        required: true
    },

    items: [
        {
            courseId: {
                type: mongoose.SchemaTypes.ObjectId,
                ref: "Course",
                required: true
            },
            priceAtPurchase: {
                type: Number,
                required: true,
                min: 0
            }
        }
    ],

    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },

    paymentStatus: {
        type: String,
        enum: ["paid"],
        default: "paid"
    }
},
{ timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
