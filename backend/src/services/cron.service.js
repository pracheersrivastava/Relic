import cron from "node-cron";
import axios from "axios";

export const startCronJob = () => {
  // Schedule a job to run every 14 minutes
  cron.schedule("*/14 * * * *", async () => {
    try {
      // Replace with your backend URL
      const response = await axios.get(
        `${process.env.BACKEND_URL}/api/v1/health`
      );
      console.log("Cron job ran successfully:", response.data);
    } catch (error) {
      console.error("Cron job failed:", error.message);
    }
  });
};

