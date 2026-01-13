import mongoose,{Schema} from "mongoose";

const enrollmentSchema = new Schema({
        courseId:{
            type: mongoose.SchemaTypes.ObjectId,
            ref:"Course",
            required: true,
        },
        userId:{
            type: mongoose.SchemaTypes.ObjectId,
            ref:"User",
            required:true,
        },
        orderId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "Order"
        },
        enrolledAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true,
    }
);

enrollmentSchema.index(
    { userId: 1, courseId: 1 },
    { unique: true }
);

export const Enrollment = mongoose.model("Enrollment",enrollmentSchema) 