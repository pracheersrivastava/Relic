import dotenv from 'dotenv';
import { app } from './app.js';
import { startCronJob } from "./services/cron.service.js";

dotenv.config({
    path: "./.env"
});

app.on("error", (error) => {
    console.log("ERROR", error);
    throw error;
});

// Start HTTP server locally only (Vercel uses serverless export)
if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
        console.log(`Server is running at port: ${PORT}`);
        startCronJob();
    });
}

export default app;