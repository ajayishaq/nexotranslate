const express = require('express');
const cors = require('cors');
const https = require('https');
const http = require('http');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

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
    const { text, sourceLang, targetLang, provider } = req.body;

    if (!text || !targetLang) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        let translation = '';

        if (provider === 'deepl' && process.env.DEEPL_API_KEY) {
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

            if (response.statusCode !== 200) {
                throw new Error(`DeepL API error: ${response.statusCode}`);
            }

            translation = response.data.translations[0].text;

        } else {
            const googleUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
            const response = await makeRequest(googleUrl, { method: 'GET' });
            
            if (Array.isArray(response.data) && response.data[0]) {
                translation = response.data[0].map(item => item[0]).join('');
            } else {
                throw new Error('Invalid response from Google Translate');
            }
        }

        res.json({ translation });

    } catch (error) {
        console.error('Translation error:', error);
        res.status(500).json({ error: 'Translation failed', details: error.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Translation server running on port ${PORT}`);
});
