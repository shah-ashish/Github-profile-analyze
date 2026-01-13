import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

import { scrapeTwoGitHubUsers } from "./PortfolioDataFetch.js";

export async function compareGitHubProfilesWithGemini(a, b) {
  const { userA, userB } = await scrapeTwoGitHubUsers(a, b);

  try {
    if (!userA || !userB) {
      throw new Error("Both userA and userB data are required for comparison.");
    }

    // Initialize Gemini client
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const model = genAI.getGenerativeModel({
      model: process.env.LLM_MODEL,
    });

    // NEW: Enhanced prompt for structured JSON output
    const prompt = `
You are an expert GitHub profile analyzer. Analyze the two GitHub users and return a STRICT JSON response for data visualization.

**CRITICAL:** Return ONLY valid JSON. No markdown, no code blocks, no preamble.

Users:
- **User A:** ${userA.username || userA.login || "userA"}
- **User B:** ${userB.username || userB.login || "userB"}

Analyze these data points and return JSON in this EXACT structure:

{
  "usernames": {
    "userA": "${userA.username || userA.login || "userA"}",
    "userB": "${userB.username || userB.login || "userB"}"
  },
  "overview": {
    "userA": "One sentence summary",
    "userB": "One sentence summary"
  },
  "metrics": {
    "activity": {
      "userA": 0-10,
      "userB": 0-10,
      "winner": "userA or userB",
      "insight": "Why this winner (max 15 words)"
    },
    "codeQuality": {
      "userA": 0-10,
      "userB": 0-10,
      "winner": "userA or userB",
      "insight": "Why this winner (max 15 words)"
    },
    "consistency": {
      "userA": 0-10,
      "userB": 0-10,
      "winner": "userA or userB",
      "insight": "Why this winner (max 15 words)"
    },
    "documentation": {
      "userA": 0-10,
      "userB": 0-10,
      "winner": "userA or userB",
      "insight": "Why this winner (max 15 words)"
    },
    "techStack": {
      "userA": 0-10,
      "userB": 0-10,
      "winner": "userA or userB",
      "insight": "Why this winner (max 15 words)"
    },
    "socialProof": {
      "userA": 0-10,
      "userB": 0-10,
      "winner": "userA or userB",
      "insight": "Why this winner (max 15 words)"
    }
  },
  "topLanguages": {
    "userA": [{"name": "JavaScript", "percentage": 45}, {"name": "Python", "percentage": 30}],
    "userB": [{"name": "Java", "percentage": 60}, {"name": "C++", "percentage": 25}]
  },
  "statistics": {
    "userA": {
      "repos": 0,
      "followers": 0,
      "following": 0,
      "stars": 0,
      "contributions": 0
    },
    "userB": {
      "repos": 0,
      "followers": 0,
      "following": 0,
      "stars": 0,
      "contributions": 0
    }
  },
  "overallScores": {
    "headToHead": {
      "userA": 0-10,
      "userB": 0-10,
      "verdict": "One sentence explaining winner"
    },
    "absolute": {
      "userA": 0-10,
      "userB": 0-10,
      "explanation": "One sentence explaining scores vs perfect profile"
    }
  },
  "strengths": {
    "userA": ["strength 1", "strength 2", "strength 3"],
    "userB": ["strength 1", "strength 2", "strength 3"]
  },
  "weaknesses": {
    "userA": ["weakness 1", "weakness 2"],
    "userB": ["weakness 1", "weakness 2"]
  },
  "missingElements": {
    "userA": ["missing item 1", "missing item 2"],
    "userB": ["missing item 1", "missing item 2"]
  },
  "improvements": {
    "userA": ["actionable tip 1", "actionable tip 2", "actionable tip 3"],
    "userB": ["actionable tip 1", "actionable tip 2", "actionable tip 3"]
  },
  "finalVerdict": "2-3 sentence final comparison"
}

# USER DATA

## ${userA.username || "userA"}
${JSON.stringify(userA, null, 2)}

## ${userB.username || "userB"}
${JSON.stringify(userB, null, 2)}

Return ONLY the JSON object. No other text.
`;

    // Send to Gemini
    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    
    // Clean up response - remove markdown code blocks if present
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Parse JSON response
    let analyticsData;
    try {
      analyticsData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("[ERROR] Failed to parse LLM response as JSON:", parseError);
      console.error("Raw response:", responseText);
      throw new Error("LLM returned invalid JSON format");
    }

     console.log(analyticsData);
     
    return {
      success: true,
      analyticsData: analyticsData,
      rawComparison: responseText // Keep raw text as backup
    };
  } catch (err) {
    console.error("[ERROR] Gemini comparison failed:", err);
    return {
      success: false,
      error: err.message,
    };
  }
}