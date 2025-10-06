const https = require('https');
const http = require('http');

function makeRequest(url, options, postData) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const protocol = urlObj.protocol === 'https:' ? https : http;
        
        const req = protocol.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ data: JSON.parse(data), statusCode: res.statusCode });
                } catch (e) {
                    resolve({ data: data, statusCode: res.statusCode });
                }
            });
        });
        
        req.on('error', reject);
        if (postData) req.write(postData);
        req.end();
    });
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text, sourceLang, targetLang } = req.body;

    if (!text || !targetLang) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        let translation = '';
        let usedDeepL = false;

        if (process.env.DEEPL_API_KEY) {
            try {
                const formData = new URLSearchParams();
                formData.append('auth_key', process.env.DEEPL_API_KEY);
                formData.append('text', text);
                formData.append('target_lang', targetLang.toUpperCase());
                if (sourceLang !== 'auto') {
                    formData.append('source_lang', sourceLang.toUpperCase());
                }

                const response = await makeRequest(
                    'https://api-free.deepl.com/v2/translate',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Content-Length': Buffer.byteLength(formData.toString())
                        }
                    },
                    formData.toString()
                );

                if (response.statusCode === 200) {
                    translation = response.data.translations[0].text;
                    usedDeepL = true;
                } else {
                    throw new Error(`DeepL API error: ${response.statusCode}`);
                }
            } catch (deeplError) {
                console.error('DeepL failed, falling back to LibreTranslate:', deeplError.message);
            }
        }

        if (!usedDeepL) {
            const libreTranslateUrl = process.env.LIBRETRANSLATE_URL || 'https://libretranslate.com/translate';
            const libreBody = JSON.stringify({
                q: text,
                source: sourceLang === 'auto' ? 'auto' : sourceLang,
                target: targetLang,
                format: 'text',
                api_key: process.env.LIBRETRANSLATE_API_KEY || ''
            });

            const response = await makeRequest(
                libreTranslateUrl,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(libreBody)
                    }
                },
                libreBody
            );

            if (response.statusCode !== 200) {
                throw new Error(`LibreTranslate API error: ${response.statusCode}`);
            }

            translation = response.data.translatedText;
        }

        res.status(200).json({ translation });

    } catch (error) {
        console.error('Translation error:', error);
        res.status(500).json({ error: 'Translation failed', details: error.message });
    }
};
