import mongoose,{Schema} from "mongoose";

const sectionSchema = new Schema({

        courseId:{
            type: mongoose.SchemaTypes.ObjectId,
            ref: "Course",
            required:true,
        },
        title:{
            type: String,
            required: true,
            trim: true,
        },
        order:{
            type: Number,
            required: true,
        },
    },
    {
        timestamps:true,
    }
);

export const Section = mongoose.model("Section",sectionSchema);