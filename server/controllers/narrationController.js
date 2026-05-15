import { openai } from '../utils/openaiClient.js';
import Narration from '../models/Narration.js';

export const getNarration = async (req, res) => {
  try {
    const { userAction, context } = req.body;

   
    if (!userAction || !context) {
      console.error("Validation Error: Missing userAction or context");
      return res.status(400).json({ error: "Missing userAction or context in request body." });
    }

  
    const response = await openai.chat.completions.create({
      model: "llama-3.1-8b-instant", 
      messages: [
        { role: "system", content: "You are a historical narrator." },
        { role: "user", content: `Action: ${userAction}, Context: ${context}` }
      ],
    });

  
    const aiContent = response.choices[0]?.message?.content;

    if (!aiContent) {
      throw new Error("The AI returned an empty or invalid response.");
    }


    const newEntry = new Narration({
      userAction,
      context,
      aiResponse: aiContent
    });
    
    await newEntry.save();


    res.json({ narration: aiContent });

  } catch (error) {
    
    console.error("🔥 FULL AI OR DATABASE ERROR:", error);
    
    res.status(500).json({ error: error.message || "An unexpected error occurred." });
  }
};