// /api/generate.js

// Helper function to set CORS headers and handle preflight requests
const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*') // Allow all origins for simplicity. For production, you might want to restrict this to your domain.
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  // Handle the browser's preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }
  return await fn(req, res)
}

const handler = async (request, response) => {
  // We can keep this check for clarity, although the CORS helper handles OPTIONS requests.
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  // Retrieve the secret API key from Vercel's Environment Variables
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return response.status(500).json({ message: 'API key not configured on the server.' });
  }

  try {
    // Get the raw inputs from the app's request body
    const { inputText, style, audience, length, keywords, instructions } = request.body;
    if (!inputText) {
      return response.status(400).json({ message: 'Input text is missing.' });
    }

    // Define the System Instruction and Prompt Template on the SERVER
    const systemInstruction = "You are a professional writing assistant and style adaptation expert. Your sole function is to receive structured input parameters and transform text according to precise specifications. You must follow these rules without exception: 1. Parameter-Based Execution: You will receive the user's original text and five distinct parameters. You must process the text strictly according to these parameters and nothing else. 2. Parameter Hierarchy: Process parameters in this order of priority: $instructions (highest), $style, $audience, $length, $keywords (lowest). 3. Keyword Handling: The $keywords parameter lists words/phrases that should appear in the output only if they naturally fit the context. Never force keywords if they disrupt flow, coherence, or style. If they cannot be integrated naturally, omit them without comment. 4. Output Format: Return only the transformed text. No explanations, no markdown, no disclaimers, no commentary on changes made, and no labels.";

    const promptTemplate = `
      Style: ${style}
      Target Audience: ${audience}
      Length: ${length}
      Keywords to include: ${keywords}
      Additional Instructions: ${instructions}
      
      ---
      TEXT TO REWRITE:
      ${inputText}
      ---
    `;

    // Construct the request to the actual Google Gemini API
    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const requestBody = {
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [{ parts: [{ text: promptTemplate }] }],
    };

    // Call the Google API
    const googleResponse = await fetch(geminiApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!googleResponse.ok) {
      const errorBody = await googleResponse.json();
      console.error('Google API Error:', errorBody);
      return response.status(googleResponse.status).json({
        message: 'Failed to get a response from the AI service.',
        error: errorBody.error.message,
      });
    }

    const data = await googleResponse.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No content generated.';

    // The Android app expects a JSON object with a "generatedText" key.
    return response.status(200).json({ generatedText: generatedText });

  } catch (error) {
    console.error('Internal Server Error:', error);
    return response.status(500).json({ message: 'An internal server error occurred.' });
  }
}

// Wrap the main handler with the CORS middleware
export default allowCors(handler);
