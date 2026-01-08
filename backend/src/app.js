import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors())  //USE is used for middleware 
app.use(express.json({limit:'8kb'})); //setting JSON limit
app.use(express.urlencoded({extended: true, limit:"8kb"}));
app.use(express.static("public"));
app.use(cookieParser());

//routes

//import userRouter from "./routes/user.routes.js";


//app.use("/api/v1/users",userRouter) 

//http://localhost:5000/api/v1/users/registers

export { app };