// SeWalk AI — Vercel Serverless Function
// Converted from Netlify Edge Function (Deno) → Vercel (Node.js)

const ALLOWED_ORIGINS = [
  'https://sewalk-ai.vercel.app',
  'https://sewalk-ai-app.netlify.app',
  'https://sewalk-ai-0e0188.netlify.app',
  'https://sewalk-ai-c05935.netlify.app',
  'https://sewalk-ai.netlify.app',
  'https://genuine-otter-85f43c.netlify.app',
  'http://localhost:3000',
  'http://localhost:8888',
  // ADD YOUR ACTUAL VERCEL URL BELOW (e.g. 'https://official-sewalk-ai.vercel.app')
];

export default async function handler(req, res) {
  const origin = req.headers['origin'] || '';
  const isAllowed = ALLOWED_ORIGINS.includes(origin);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', isAllowed ? origin : ALLOWED_ORIGINS[0]);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Origin check
  if (!isAllowed) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const body = req.body;

    // Read API key from Vercel environment variable
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in Vercel environment variables.');
    }

    // Build conversation history
    const contents = (body.messages || [])
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

    // If image is attached, replace the last user message with multimodal content
    if (body.image && body.image.base64) {
      const imagePart = {
        inline_data: {
          mime_type: body.image.mime || 'image/jpeg',
          data: body.image.base64,
        },
      };
      const textPart = { text: body.imageText || 'Please analyse this image.' };
      if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
        contents[contents.length - 1].parts = [imagePart, textPart];
      } else {
        contents.push({ role: 'user', parts: [imagePart, textPart] });
      }
    }

    const MODEL = 'gemini-3.1-flash-lite-preview';
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: body.system || 'You are a helpful assistant.' }],
          },
          contents: contents,
          generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.7,
          },
        }),
      }
    );

    const data = await geminiResponse.json();
    if (!geminiResponse.ok || data?.error) {
      const errMsg = data?.error?.message || `Gemini API error ${geminiResponse.status}`;
      throw new Error(errMsg);
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Sorry, I could not generate a response.';

    return res.status(200).json({ content: [{ type: 'text', text }] });

  } catch (err) {
    console.error('SeWalk AI chat error:', err.message);
    return res.status(500).json({
      content: [{ type: 'text', text: `⚠️ Server error: ${err.message}` }],
    });
  }
}
