import mongoose,{Schema} from "mongoose";
const lessonSchema = new Schema(
    {
        sectionId:{
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'Section',
            required: true,
        },
        title: {
            type: String,
            trim: true,
            required: true,
        },
        videoUrl: {
            type: String,
            required: true,
        },
        duration:{
            type: Number,
            required: true
        },
        order:{
            type: Number,
            required: true
        },
    },
    {
        timestamps: true,
    }
);

export const Lesson = mongoose.model("Lesson",lessonSchema);