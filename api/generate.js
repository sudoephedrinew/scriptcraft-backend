// api/generate.js

// The Vercel platform handles the request and response objects for us.
// This function will be executed every time a request is made to /api/generate
export default async function handler(req, res) {
  // We need to import the SDK this way for Vercel's serverless environment
  const { GoogleGenerativeAI } = await import('@google/generative-ai');

  // 1. Get the API key from the secure environment variable you set in the Vercel dashboard.
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  try {

    // 4. Send the successful result back to your Android app.
    return genAI;
    
  } catch (error) {
    // If anything goes wrong, log the error on the server and send a generic error message back to the app.
    console.error(error);
    return res.status(500).json({ error: "Failed to call Gemini API" });
  }
}
