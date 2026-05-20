import dotenv from 'dotenv';
dotenv.config(); // 1. Guarantees your .env file is loaded

import { openai } from '../utils/openaiClient.js';
import Narration from '../models/Narration.js';
import axios from 'axios';

export const getNarration = async (req, res) => {
  try {
    const { userAction, context } = req.body;

    if (!userAction || !context) {
      console.error("Validation Error: Missing userAction or context");
      return res.status(400).json({ error: "Missing userAction or context in request body." });
    }

    // 1. Generate text response with your AI model
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

    // 2. Save to database
    const newEntry = new Narration({
      userAction,
      context,
      aiResponse: aiContent
    });
    
    await newEntry.save();

    // 3. Generate Audio using ElevenLabs
    let audioBase64 = null;
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';

    // 2. Diagnostic Log: Tells you immediately if your .env file is working
    console.log("Checking API Key status:", apiKey ? "✅ Key loaded in memory!" : "❌ Key is UNDEFINED! Check your .env file.");

    if (apiKey) {
      try {
        const elevenLabsResponse = await axios.post(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
          {
            text: aiContent,
            model_id: "eleven_turbo_v2", // 4. Switched to Turbo for faster game response times
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5
            }
          },
          {
            headers: {
              'Accept': 'audio/mpeg',
              'xi-api-key': apiKey,
              'Content-Type': 'application/json',
            },
            responseType: 'arraybuffer'
          }
        );

        // Convert successful audio to base64
        audioBase64 = Buffer.from(elevenLabsResponse.data, 'binary').toString('base64');
        
      } catch (audioError) {
        console.error("⚠️ ElevenLabs Audio Generation Failed:", audioError.response?.status, audioError.response?.statusText);
        
        // 3. Deep Error Extraction: Decodes ElevenLabs' specific error reason
        if (audioError.response && audioError.response.data) {
          try {
             const errorData = Buffer.from(audioError.response.data).toString('utf8');
             console.error("ElevenLabs Error Details:", JSON.parse(errorData));
          } catch (parseError) {
             console.error("Could not parse ElevenLabs error data.");
          }
        }
      }
    } else {
      console.warn("⚠️ Skipping audio: No ELEVENLABS_API_KEY found in environment variables.");
    }

    // 4. Return text and audio back to the frontend
    res.json({ 
      narration: aiContent,
      audioData: audioBase64 
    });

  } catch (error) {
    console.error("🔥 FULL AI OR DATABASE ERROR:", error);
    res.status(500).json({ error: error.message || "An unexpected error occurred." });
  }
};