const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// 🧠 MEMORY
let chatHistory = [];

// =======================
// 🤖 ASK API
// =======================
app.post("/ask", async (req, res) => {
  const { question, level, understanding } = req.body;

  console.log("QUESTION:", question);
  console.log("API KEY:", process.env.API_KEY); // DEBUG

  let teachingStyle = "";

  if (level === "beginner") {
    teachingStyle = "Explain in very simple words with examples.";
  } else {
    teachingStyle = "Explain in detailed technical way.";
  }

  if (understanding === "no") {
    teachingStyle += " Make it even simpler and break into smaller steps.";
  }

  const systemPrompt = `
You are EduVox AI Tutor.

Teach step-by-step.

Format:
Step 1:
Step 2:
Step 3:

${teachingStyle}
`;

  chatHistory.push({ role: "user", content: question });

  if (chatHistory.length > 6) {
    chatHistory.shift();
  }

  try {
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        messages: [
          { role: "system", content: systemPrompt },
          ...chatHistory
        ]
      })
    });

    const data = await response.json();

    console.log("FULL API RESPONSE:", data); // 🔥 IMPORTANT

    // ❌ HANDLE API ERROR CLEARLY
    if (!data.choices) {
      return res.json({
        answer: "❌ API Error: " + JSON.stringify(data)
      });
    }

    let answer = data.choices[0].message.content;

    chatHistory.push({
      role: "assistant",
      content: answer
    });

    answer = answer.replace(/Step/g, "\n\nStep");

    res.json({ answer });

  } catch (error) {
    console.log("SERVER ERROR:", error);
    res.json({ answer: "❌ Server crashed" });
  }
});

// RESET
app.get("/reset", (req, res) => {
  chatHistory = [];
  res.send("Memory cleared");
});

// START
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000 🚀");
});