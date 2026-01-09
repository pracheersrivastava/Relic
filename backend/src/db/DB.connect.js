import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async()=>{
    try{
        let uri = process.env.MONGODB_URI;
        
        // Check if URI already contains a database name
        const hasDbName = /\.mongodb\.net\/[a-zA-Z]/.test(uri);
        
        const finalUri = hasDbName ? uri : `${uri}/${DB_NAME}`;
        
        const connectionInstance = await mongoose.connect(finalUri);
        console.log(`\n MongoDB connected. DB Host ${connectionInstance.connection.host}`);
    }catch(error){
        console.error("MONGODB connection error",error);
        process.exit(1);
    }
};

export default  connectDB