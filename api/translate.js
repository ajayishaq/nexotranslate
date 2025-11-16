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
    let translation = '';
    let detectedLanguage = null;
    let usedDeepL = false;

    if (process.env.DEEPL_API_KEY) {
      try {
        const deeplUrl = 'https://api-free.deepl.com/v2/translate';
        const formData = new URLSearchParams();
        formData.append('auth_key', process.env.DEEPL_API_KEY);
        formData.append('text', text);
        formData.append('target_lang', targetLang.toUpperCase());

        if (sourceLang && sourceLang !== 'auto') {
          formData.append('source_lang', sourceLang.toUpperCase());
        }

        const deeplResponse = await fetch(deeplUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString()
        });

        if (deeplResponse.ok) {
          const deeplData = await deeplResponse.json();
          translation = deeplData.translations[0].text;
          detectedLanguage = deeplData.translations[0].detected_source_language?.toLowerCase();
          usedDeepL = true;
        } else {
          console.log('DeepL failed, falling back to LibreTranslate');
        }
      } catch (deeplError) {
        console.error('DeepL error:', deeplError);
      }
    }

    if (!usedDeepL) {
      const libreUrl = 'https://libretranslate.com/translate';

      const libreResponse = await fetch(libreUrl, {
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

      if (!libreResponse.ok) {
        throw new Error(`Translation API error: ${libreResponse.status}`);
      }

      const libreData = await libreResponse.json();
      translation = libreData.translatedText;
      detectedLanguage = libreData.detectedLanguage?.language;
    }

    return res.status(200).json({
      translation,
      detectedLanguage,
      provider: usedDeepL ? 'deepl' : 'libretranslate'
    });

  } catch (error) {
    console.error('Translation error:', error);

    return res.status(500).json({
      error: 'Translation service temporarily unavailable. Please try again.',
      details: error.message
    });
  }
}
