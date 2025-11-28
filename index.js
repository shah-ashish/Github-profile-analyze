import express from "express";
import morgan from "morgan";


import { compareGitHubProfilesWithGemini } from "./Compare.js";
import { connectToDb } from "./Db.js";
import ApiControl from "./Schema.js"; // Make sure your schema file is correct
import cors from 'cors'
const app = express();
connectToDb();

app.use(morgan("dev"));

app.use(cors({
    origin:'*'
}))

app.use(express.json());


app.post("/compare", async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // normalize to start of day

        // Find today's count document
        let apiCount = await ApiControl.findOne({ date: today });

        if (!apiCount) {
            // If no document exists for today, create one
            apiCount = new ApiControl({ date: today, count: 0 });
        }

        if (apiCount.count >= 5) {
            return res.status(429).json({
                success:false,
                error: "API call limit reached for today. Try again tomorrow."
            });
        }

        // Extract users from request
        const { userA, userB } = req.body;

        if (!userA || !userB) {
            return res.status(400).json({ message: "Both userA and userB are required." });
        }

        // Process API call
        const result = await compareGitHubProfilesWithGemini(userA, userB);

        // Increment count
        apiCount.count += 1;
        await apiCount.save();

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.listen(80, () => console.log("Server running on port 80"));
