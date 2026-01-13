import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));
app.use(express.json({limit:'8kb'})); //setting JSON limit
app.use(express.urlencoded({extended: true, limit:"8kb"}));
app.use(express.static("public"));
app.use(cookieParser());

//routes

import userRouter from "./routes/user.routes.js";
import courseRouter from"./routes/courses.routes.js";
import cartRouter from "./routes/cart.routes.js";

app.use("/api/v1/users",userRouter);
app.use("/api/v1/courses",courseRouter);
app.use("/api/v1/cart",cartRouter);

//http://localhost:5000/api/v1/users/registers

export { app };