import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();
import fs from "fs";

import { scrapeTwoGitHubUsers } from "./PortfolioDataFetch.js";

export async function compareGitHubProfilesWithGemini(a,b) {
  const { userA, userB } = await scrapeTwoGitHubUsers(
 a,b
  );

  try {
    if (!userA || !userB) {
      throw new Error("Both userA and userB data are required for comparison.");
    }

    // Initialize Gemini client
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const model = genAI.getGenerativeModel({
      model: process.env.LLM_MODEL,
    });

    // Prepare prompt for Markdown (README friendly) result
    const prompt = `
You are an expert GitHub profile evaluator. You will receive the scraped JSON data of two GitHub users.

Your job:

---
## 1️⃣ IDENTITIES  
Always refer to users by their Username, NOT "userA/userB".

Let:
- **User A Username:** ${userA.username || userA.login || "userA"}
- **User B Username:** ${userB.username || userB.login || "userB"}

Use these names throughout the report.

---
## 2️⃣ TASK  
Generate a **non-generic**, **deeply personalized**, **data-dependent** GitHub comparison report in **README.md style layout**.

Everything MUST be based STRICTLY on the users' scraped data:
- repos  
- languages  
- bio  
- followers  
- following  
- stars  
- pinned projects  
- commit history  
- contributions  
- profile completeness  
- project quality  
- README quality  
- coding patterns  
- consistency  
- activity timeline  

No filler text.  
No assumptions unless logically inferred from missing/null fields.

---
## 3️⃣ STRUCTURE  
Output must be **clean markdown**, in this order:

# 🔍 GitHub Profile Comparison Report  

## 🧑‍💻 Profile Overview  
Short, personalized summary for each username.

## ⚔️ Head-to-Head Comparison  
A detailed table comparing both users across:
- Activity level  
- Repo quality  
- Consistency  
- Tech stack depth  
- Profile completeness  
- Writing quality  
- Stars, followers, social proof  
- Highlights (strongest parts)
- Weak points (actual weaknesses from data)  

Make it very specific.

## ⭐ Dynamic Strengths & Weaknesses  
### ${userA.username}
- Strengths:
- Weaknesses:

### ${userB.username}
- Strengths:
- Weaknesses:

## 📊 Scoring (Dynamic, Not Generic)
Give 2 types of scores:

### **1. Head-to-Head Score (0–10)**
Score how much **${userA.username} outperforms ${
      userB.username
    }**, OR vice-versa.  
Always explain WHY with actual data.

### **2. Absolute Quality Score (0–10)**
Score each user vs a **Perfect GitHub Profile**, based on:
- Profile completeness  
- README quality  
- Repo structure  
- Code quality  
- Contribution graph  
- Tech stack depth  
- Project originality  
- Documentation  
- Professional presentation  

Example output format:
- **${userA.username}: 7.5/10**
- **${userB.username}: 5.8/10**

## 🚀 Improvement Suggestions (Dynamic)
Provide **personalized, actionable** improvement steps for each user.  
Avoid generic advice.  
Base every point on the actual JSON data.

## 📝 Missing Elements Checklist  
Tell both users what key elements are missing from their profile explicitly:
- No pinned projects?  
- No README?  
- Empty bio?  
- No languages?  
- No contributions?  
- No stars or forks?  
- No real projects?  

## 🎯 Final Verdict  
A short, sharp, dynamic final comparison based ONLY on the scraped data.

---

# USER DATA (Raw JSON)

## ${userA.username}
${JSON.stringify(userA, null, 2)}

## ${userB.username}
${JSON.stringify(userB, null, 2)}

output must be in markdown format
replace userA and userB with ther username
Generate the final report now.
`;

    // Send to Gemini
    const result = await model.generateContent(prompt);

    return {
      success: true,
      comparison: result.response.text(),
    };
  } catch (err) {
    console.error("[ERROR] Gemini comparison failed:", err);
    return {
      success: false,
      error: err.message,
    };
  }
}


