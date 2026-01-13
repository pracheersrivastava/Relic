import mongoose,{Schema} from "mongoose";

const cartSchema = new Schema({
        userId:{
            type: mongoose.SchemaTypes.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        items: [
            {
                courseId: {
                    type: mongoose.SchemaTypes.ObjectId,
                    ref: "Course",
                    required: true
                },
                price: {
                    type: Number,
                    required: true,
                    min: 0
                }
            }
        ]
    },
    {
        timestamps: true,
    }
);
export const Cart = mongoose.model("Cart",cartSchema);