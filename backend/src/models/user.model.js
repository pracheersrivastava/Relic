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

userSchema.pre("save",async function (){
    if(!this.isModified("password")) //check if password is not moddified skip the hashing
        return;
    this.password = await bcrypt.hash(this.password,8);
}) //pre hook

userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password,this.password); //return is a boolean
}; //checkif Password is valid

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            fullname: this.fullname,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    )
};

userSchema.methods.generateRefreshToken = function(){
        return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            fullname: this.fullname,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    )
};

export const User = mongoose.model("User",userSchema);