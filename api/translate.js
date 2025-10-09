// Vercel Serverless Function for Translation
// Place this file in: api/translate.js

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, sourceLang, targetLang } = req.body;

  if (!text || !targetLang) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // Using LibreTranslate API (free and open-source)
    const apiUrl = 'https://libretranslate.com/translate';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceLang === 'auto' ? 'auto' : sourceLang,
        target: targetLang,
        format: 'text'
      })
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();

    return res.status(200).json({
      translation: data.translatedText,
      detectedLanguage: data.detectedLanguage
    });

  } catch (error) {
    console.error('Translation error:', error);
    
    // Fallback: Return a user-friendly error
    return res.status(500).json({
      error: 'Translation service temporarily unavailable. Please try again.',
      details: error.message
    });
  }
}
