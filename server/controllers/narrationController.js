import { openai } from '../utils/openaiClient.js';
import Narration from '../models/Narration.js';

export const getNarration = async (req, res) => {
  try {
    const { userAction, context } = req.body;

    // 1. Validate Input: Ensure the frontend actually sent the required data
    if (!userAction || !context) {
      console.error("Validation Error: Missing userAction or context");
      return res.status(400).json({ error: "Missing userAction or context in request body." });
    }

    // 2. Call Groq using the OpenAI SDK
    const response = await openai.chat.completions.create({
      model: "llama-3.1-8b-instant", 
      messages: [
        { role: "system", content: "You are a historical narrator." },
        { role: "user", content: `Action: ${userAction}, Context: ${context}` }
      ],
    });

    // 3. Safe Extraction: Use optional chaining to prevent crashes if the response is weird
    const aiContent = response.choices[0]?.message?.content;

    if (!aiContent) {
      throw new Error("The AI returned an empty or invalid response.");
    }

    // 4. Save to MongoDB
    const newEntry = new Narration({
      userAction,
      context,
      aiResponse: aiContent
    });
    
    await newEntry.save();

    // 5. Send successful response to frontend
    res.json({ narration: aiContent });

  } catch (error) {
    // 6. Detailed Logging: This will print the EXACT reason for the 500 error in your terminal
    console.error("🔥 FULL AI OR DATABASE ERROR:", error);
    
    res.status(500).json({ error: error.message || "An unexpected error occurred." });
  }
};