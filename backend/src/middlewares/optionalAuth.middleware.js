import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const optionalAuth = async (req, res, next) => {
  try {
    //  Try to read token (cookie first, then header)
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    // If no token → guest user
    if (!token) {
      req.user = null;
      return next();
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    // 4️Attach user (without sensitive fields)
    const user = await User.findById(decoded._id)
      .select("-password -refreshToken");

    if (!user) {
      req.user = null;
      return next();
    }

    req.user = user;
    next();
  } catch (error) {
    // Invalid token → still allow request
    req.user = null;
    next();
  }
};
