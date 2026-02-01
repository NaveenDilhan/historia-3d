import { openai } from '../utils/openaiClient.js';
import Narration from '../models/Narration.js'; // New import

export const getNarration = async (req, res) => {
  try {
    const { userAction, context } = req.body;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a historical narrator." },
        { role: "user", content: `Action: ${userAction}, Context: ${context}` }
      ],
    });

    const aiContent = response.choices[0].message.content;

    // Save to MongoDB
    const newEntry = new Narration({
      userAction,
      context,
      aiResponse: aiContent
    });
    await newEntry.save();

    res.json({ narration: aiContent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};