// api/generate.js

// Import the Google AI SDK
import { GoogleGenerativeAI } from '@google/generative-ai';

// This is the main function that Vercel will run
export default async function handler(req, res) {
  // --- FIX #1: Check the request method ---
  // We only want to process POST requests.
  if (req.method !== 'POST') {
    // If it's not a POST, send an error and stop.
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // --- FIX #2: Safely access the body ---
    // Instead of destructuring immediately, we get the body first.
    // Vercel automatically parses the JSON body for POST requests.
    const body = req.body;

    // A safety check for debugging. You can view this in the Vercel logs.
    console.log("Received body:", body);

    // Now, we can safely get the prompt from the parsed body.
    const prompt = body.prompt;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required in the request body" });
    }
    
    // The rest of the code is the same
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ result: text });

  } catch (error) {
    // If anything goes wrong, log the error and send a generic message.
    console.error("Error processing request:", error);
    return res.status(500).json({ error: "An internal server error occurred" });
  }
}
