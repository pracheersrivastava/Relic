import mongoose from "mongoose";
import connectDB from "../db/DB.connect.js";

let dbPromise = null;

const ensureDbConnected = async (req, res, next) => {
    try {
        if (mongoose.connection.readyState === 1) {
            return next();
        }

        if (!dbPromise) {
            dbPromise = connectDB().catch((err) => {
                dbPromise = null;
                throw err;
            });
        }

        await dbPromise;
        next();
    } catch (error) {
        next(error);
    }
};

export { ensureDbConnected };
