// api/generate.js

export default async function handler(req, res) {
  try {
    // Access the key from your Vercel Environment Variables
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "API Key not found in environment" });
    }

    // Send the key back to the app
    return res.status(200).json({ key: apiKey });
    
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
}
