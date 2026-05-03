import OpenAI from 'openai';
import 'dotenv/config'; // Make absolutely sure env variables are loaded here

const groqKey = process.env.GROQ_API_KEY;

if (!groqKey) {
  console.error("FATAL ERROR: GROQ_API_KEY is missing from your .env file!");
}

export const openai = new OpenAI({
  apiKey: groqKey || "dummy-key-to-prevent-crash", 
  baseURL: "https://api.groq.com/openai/v1", 
});