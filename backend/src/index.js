import dotenv from 'dotenv';
import connectDB from './db/DB.connect.js';
import { app } from './app.js';
import { startCronJob } from "./services/cron.service.js";

dotenv.config({
    path: "./.env"
});

// Connect to database immediately for serverless
let dbPromise = null;

const getDbConnection = () => {
    if (!dbPromise) {
        dbPromise = connectDB().catch(err => {
            console.error("MONGO db connection failed!!!", err);
            dbPromise = null; // Reset on error to allow retry
            throw err;
        });
    }
    return dbPromise;
};

// Ensure DB is connected
getDbConnection();

app.on("error", (error) => {
    console.log("ERROR", error);
    throw error;
});

// Start HTTP server
getDbConnection().then(() => {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
        console.log(`Server is running at port: ${PORT}`);
        startCronJob();
    });
});

export default app;
