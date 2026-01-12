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
    }
});

export const Enrollment = mongoose.model("Enrollment",enrollmentSchema) 