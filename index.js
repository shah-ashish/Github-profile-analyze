import express from "express";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { compareGitHubProfilesWithGemini } from "./Compare.js";
import { connectToDb } from "./Db.js";
import ApiControl from "./Schema.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 5000;

const app = express();
connectToDb();
app.use(express.json());
app.use(morgan("dev"));
app.use(cors({ origin: "*" }));


const clientDistPath = path.join(__dirname, "client", "dist");

// 🚀 Serve Vite build assets through the backend
app.use(express.static(clientDistPath));

app.post("/compare", async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let apiCount = await ApiControl.findOne({ date: today });

        if (!apiCount) apiCount = new ApiControl({ date: today, count: 0 });

        if (apiCount.count >= 7) {
            return res.status(429).json({
                success: false,
                error: "API call limit reached for today. Try again tomorrow."
            });
        }

        const { userA, userB } = req.body;

        if (!userA || !userB) {
            return res.status(400).json({ message: "Both userA and userB are required." });
        }

        const result = await compareGitHubProfilesWithGemini(userA, userB);

        apiCount.count += 1;
        await apiCount.save();

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// ⭐ Catch-all route for React Router
app.get(/^\/.*/, (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
