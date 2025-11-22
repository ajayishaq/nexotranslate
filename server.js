import express from 'express';
import cors from 'cors';
import https from 'https';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static files from dist folder (frontend build)
const distPath = path.join(__dirname, 'dist');

// Disable caching for HTML files
app.use((req, res, next) => {
    if (req.path.endsWith('.html') || req.path === '/' || req.path === '') {
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate, private');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
    }
    next();
});

app.use(express.static(distPath));

const languageMappings = {
  'auto': 'auto',
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
                } else {
                    throw new Error(`DeepL API error: ${response.statusCode}`);
                }
            } catch (deeplError) {
                console.error('DeepL failed, falling back to MyMemory:', deeplError.message);
            }
        }

        if (!usedDeepL) {
            const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${mappedSourceLang}|${mappedTargetLang}`;
            
            console.log('MyMemory request:', myMemoryUrl);

            const response = await makeRequest(myMemoryUrl, {});

            if (response.statusCode !== 200) {
                console.error('MyMemory error response:', response);
                throw new Error(`MyMemory API error: ${response.statusCode}`);
            }

            const data = response.data;
            if (data.responseStatus !== 200) {
                throw new Error(`MyMemory API error: ${data.responseStatus} - ${data.responseDetails}`);
            }

            translation = data.responseData.translatedText;
            
            if (!translation || translation.trim() === '') {
                throw new Error('Empty translation received');
            }
        }

        res.json({ translation });

    } catch (error) {
        console.error('Translation error:', error);
        res.status(500).json({ error: 'Translation failed', details: error.message });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Translation server is running' });
});

// Fallback to index.html for SPA routing
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Translation server running on http://0.0.0.0:${PORT}`);
    console.log('Nexo Translator - Latest build deployed');
});
