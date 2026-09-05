import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function testGemini() {
  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: 'Reply with exactly: Gemini is working!',
  });

  console.log(response.text);
}

testGemini().catch(console.error);