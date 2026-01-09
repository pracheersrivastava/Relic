import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponce} from "../utils/ApiResponce.js";
import {User} from "../models/user.model.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const registerUser = asyncHandler(async(req,res)=>{
    const {fullname,email,password}=req.body;
    if ([fullname,email,password].some((field) => field?.trim() === "")) // some array method use
    {
            throw new ApiError(400, "All fields are required");
    };
    const isExisting = await User.findOne({
            $or:  [{email}]
    });
    if(isExisting){
            throw new ApiError(409,"Email already exists");
    }
    const user = await User.create({
        fullname,
        email : email.toLowerCase(),
        password,
    });
    const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
    )

    if(!createdUser){
            throw new ApiError(500,"Error creating new user")
    }
    return res
    .status(201)
    .json(
            new ApiResponce(201,createdUser,"User registered successfully")
    );  
})

const loginUser = asyncHandler(async(req,res)=>{
    const {email,password} = req.body;

    if(!email||!password){
        throw new ApiError(400,"All fields require");
    };

    const user = await User.findOne({email})
    if(!user){
        throw new ApiError(404,"User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(410,"Invalid Credentials");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave:false});

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    console.log(loggedInUser);

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
            new ApiResponce(200,{
                    user: loggedInUser, accessToken, refreshToken}, 
                    "User logged in successfully"
            )
    );

});
export{
    registerUser,
    loginUser
}