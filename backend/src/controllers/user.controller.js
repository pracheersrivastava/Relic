import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
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

const loginUser = asyncHandler(async(res,req)=>{})


export{
    registerUser,
    loginUser
}