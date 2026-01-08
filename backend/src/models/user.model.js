import mongoose,{Schema} from "mongoose";


const userSchema = new Schema({
    email:{
            type: String,
            required: true,
            unique: true,
            lowercase: true, 
            trim: true,
        },
        fullname:{
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        password:{
            type:String,
            required:[true,"Password is required"]
        },
        refreshToken:{
            type:String,
        }   
    },
    {
        timestamps: true,
    }
)

export const User = mongoose.model("User",userSchema);