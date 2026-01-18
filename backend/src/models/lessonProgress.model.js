import mongoose, { Schema } from "mongoose";

const lessonProgressSchema = new Schema(
    {
        userId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        lessonId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "Lesson",
            required: true,
            index: true,
        },
        progress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        completed: {
            type: Boolean,
            default: false,
        },
        completedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// prevention of duplicate completion records
lessonProgressSchema.index(
    { userId: 1, lessonId: 1 },
    { unique: true }
);

export const LessonProgress = mongoose.model("LessonProgress", lessonProgressSchema);
