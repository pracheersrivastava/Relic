import dotenv from 'dotenv';
import connectDB from './db/DB.connect.js';
import { app } from './app.js';

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

// For local development - start HTTP server
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    getDbConnection().then(() => {
        const PORT = process.env.PORT || 8000;
        app.listen(PORT, () => {
            console.log(`Server is running at port: ${PORT}`);
        });
    });
}

// Export for Vercel serverless
export default app;
