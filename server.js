import express from 'express';
import cors from 'cors';
import https from 'https';
import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

app.use(cors());
app.use(express.json());

const languageMappings = {
  'ha': 'yo',
  'ig': 'yo',
  'fi': 'fi',
  'bg': 'bg',
  'sl': 'sl',
  'hr': 'hr',
  'lt': 'lt',
  'lv': 'lv',
  'et': 'et'
};

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

app.post('/api/translate', async (req, res) => {
    const { text, sourceLang, targetLang } = req.body;

    if (!text || !targetLang) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        let translation = '';
        let usedDeepL = false;

        let mappedSourceLang = languageMappings[sourceLang] || sourceLang;
        let mappedTargetLang = languageMappings[targetLang] || targetLang;

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
                }
            } catch (deeplError) {
                console.error('DeepL failed, falling back to MyMemory');
            }
        }

        if (!usedDeepL) {
            const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${mappedSourceLang}|${mappedTargetLang}`;
            
            const response = await makeRequest(myMemoryUrl, {});

            if (response.statusCode !== 200 || response.data.responseStatus !== 200) {
                throw new Error('Translation API error');
            }

            translation = response.data.responseData.translatedText;
        }

        res.json({ translation });

    } catch (error) {
        console.error('Translation error:', error);
        res.status(500).json({ error: 'Translation failed' });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Translation server running on port ${PORT}`);
});
