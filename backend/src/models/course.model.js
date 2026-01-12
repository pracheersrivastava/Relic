import mongoose,{Schema} from "mongoose";

const courseSchema = new Schema({
        title:{
            type: String,
            required: true,
            trim: true,
        },
        subtitle:{
            type: String,
            trim: true,
        },
        description:{
            type:String,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
            default: 0,
            minimum: 0,
        },
    },
    {
        timestamps: true,
    }
);

export const Course = mongoose.model("Course",courseSchema);