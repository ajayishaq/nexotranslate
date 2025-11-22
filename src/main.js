import { supabase } from './lib/supabase.js';
import {
    saveTranslation,
    getTranslationHistory,
    getFavoriteTranslations,
    toggleFavorite,
    deleteTranslation
} from './services/translationService.js';
import { detectLanguageAdvanced } from './utils/languageDetection.js';
import { getWordCount, getCharacterCount } from './utils/textAnalysis.js';

const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'tr', name: 'Turkish' },
    { code: 'nl', name: 'Dutch' },
    { code: 'pl', name: 'Polish' },
    { code: 'sv', name: 'Swedish' },
    { code: 'fi', name: 'Finnish' },
    { code: 'da', name: 'Danish' },
    { code: 'no', name: 'Norwegian' },
    { code: 'cs', name: 'Czech' },
    { code: 'el', name: 'Greek' },
    { code: 'he', name: 'Hebrew' },
    { code: 'id', name: 'Indonesian' },
    { code: 'ms', name: 'Malay' },
    { code: 'th', name: 'Thai' },
    { code: 'vi', name: 'Vietnamese' },
    { code: 'uk', name: 'Ukrainian' },
    { code: 'bg', name: 'Bulgarian' },
    { code: 'ro', name: 'Romanian' },
    { code: 'bn', name: 'Bengali' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' },
    { code: 'hu', name: 'Hungarian' },
    { code: 'sk', name: 'Slovak' },
    { code: 'sl', name: 'Slovenian' },
    { code: 'hr', name: 'Croatian' },
    { code: 'sr', name: 'Serbian' },
    { code: 'lt', name: 'Lithuanian' },
    { code: 'lv', name: 'Latvian' },
    { code: 'et', name: 'Estonian' },
    { code: 'ha', name: 'Hausa (Nigeria)' },
    { code: 'yo', name: 'Yoruba (Nigeria)' },
    { code: 'ig', name: 'Igbo (Nigeria)' }
];

let state = {
    sourceLang: 'en',
    targetLang: 'es',
    isTranslating: false,
    currentTranslationId: null,
    detectedLang: null,
    history: [],
    favorites: []
};

const elements = {
    sourceLang: document.getElementById('source-lang'),
    targetLang: document.getElementById('target-lang'),
    swapBtn: document.getElementById('swap-btn'),
    sourceInput: document.getElementById('source-input'),
    translationOutput: document.getElementById('translation-output'),
    translateBtn: document.getElementById('translate-btn'),
    charCount: document.getElementById('char-count'),
    wordCount: document.getElementById('word-count'),
    outputWordCount: document.getElementById('output-word-count'),
    clearBtn: document.getElementById('clear-btn'),
    copyBtn: document.getElementById('copy-btn'),
    speakBtn: document.getElementById('speak-btn'),
    favoriteBtn: document.getElementById('favorite-btn'),
    micBtn: document.getElementById('mic-btn'),
    themeBtn: document.getElementById('theme-btn'),
    detectionBadge: document.getElementById('detection-badge'),
    historyList: document.getElementById('history-list'),
    favoritesList: document.getElementById('favorites-list'),
    clearHistoryBtn: document.getElementById('clear-history-btn'),
    clearFavoritesBtn: document.getElementById('clear-favorites-btn'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toast-message')
};

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
}

function initLanguageSelectors() {
    languages.forEach(lang => {
        const sourceOption = document.createElement('option');
        sourceOption.value = lang.code;
        sourceOption.textContent = lang.name;
        elements.sourceLang.appendChild(sourceOption);
    });

    languages.forEach(lang => {
        const targetOption = document.createElement('option');
        targetOption.value = lang.code;
        targetOption.textContent = lang.name;
        elements.targetLang.appendChild(targetOption);
    });

    elements.sourceLang.value = state.sourceLang;
    elements.targetLang.value = state.targetLang;
}

function updateTextStats() {
    const text = elements.sourceInput.value;
    const chars = getCharacterCount(text);
    const words = getWordCount(text);

    elements.charCount.textContent = chars;
    elements.wordCount.textContent = words;
}

function updateOutputStats() {
    const text = elements.translationOutput.textContent;
    const words = getWordCount(text);
    elements.outputWordCount.textContent = words;
}


async function translate() {
    const text = elements.sourceInput.value.trim();

    if (!text || state.isTranslating) return;

    state.isTranslating = true;
    elements.translateBtn.disabled = true;
    elements.translateBtn.innerHTML = '<span class="loading-spinner"></span><span>Translating...</span>';

    try {
        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text,
                sourceLang: state.sourceLang,
                targetLang: state.targetLang
            })
        });

        const data = await response.json();

        if (data.translation) {
            elements.translationOutput.textContent = data.translation;
            updateOutputStats();

            const saved = await saveTranslation({
                sourceText: text,
                translatedText: data.translation,
                sourceLang: state.sourceLang,
                targetLang: state.targetLang,
                detectedLang: state.detectedLang
            });

            state.currentTranslationId = saved?.id || null;

            await loadHistory();

            showToast('Translation complete');
        } else {
            throw new Error(data.error || 'Translation failed');
        }
    } catch (error) {
        console.error('Translation error:', error);
        showToast('Translation failed. Please try again.', 'error');
    } finally {
        state.isTranslating = false;
        elements.translateBtn.disabled = false;
        elements.translateBtn.innerHTML = '<span>Translate</span>';
    }
}

function swapLanguages() {
    if (state.sourceLang === 'auto') return;

    const tempLang = state.sourceLang;
    const tempText = elements.sourceInput.value;

    state.sourceLang = state.targetLang;
    state.targetLang = tempLang;

    elements.sourceLang.value = state.sourceLang;
    elements.targetLang.value = state.targetLang;

    elements.sourceInput.value = elements.translationOutput.textContent;
    elements.translationOutput.textContent = tempText;

    updateTextStats();
    updateOutputStats();

    state.currentTranslationId = null;
}

function clearText() {
    elements.sourceInput.value = '';
    elements.translationOutput.textContent = '';
    state.currentTranslationId = null;
    state.detectedLang = null;
    updateTextStats();
    updateOutputStats();
}

function copyTranslation() {
    const text = elements.translationOutput.textContent;
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard');
    }).catch(() => {
        showToast('Failed to copy', 'error');
    });
}

function speakTranslation() {
    const text = elements.translationOutput.textContent;
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const langMap = {
        'en': 'en-US', 'es': 'es-ES', 'fr': 'fr-FR', 'de': 'de-DE',
        'it': 'it-IT', 'pt': 'pt-BR', 'ru': 'ru-RU', 'zh': 'zh-CN',
        'ja': 'ja-JP', 'ko': 'ko-KR', 'ar': 'ar-SA', 'hi': 'hi-IN'
    };
    utterance.lang = langMap[state.targetLang] || 'en-US';

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
}

async function toggleFavoriteStatus() {
    if (!state.currentTranslationId) {
        showToast('Please translate some text first', 'warning');
        return;
    }

    try {
        const isFavorite = elements.favoriteBtn.classList.toggle('favorite-active');
        await toggleFavorite(state.currentTranslationId, isFavorite);
        await loadFavorites();
        showToast(isFavorite ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
        console.error('Failed to toggle favorite:', error);
        showToast('Failed to update favorites', 'error');
    }
}

function startVoiceInput() {
    if (!recognition) {
        showToast('Voice input not supported', 'error');
        return;
    }

    if (elements.micBtn.classList.contains('recording')) {
        recognition.stop();
        return;
    }

    const langMap = {
        'en': 'en-US', 'es': 'es-ES', 'fr': 'fr-FR', 'de': 'de-DE',
        'it': 'it-IT', 'pt': 'pt-BR', 'ru': 'ru-RU', 'zh': 'zh-CN',
        'ja': 'ja-JP', 'ko': 'ko-KR', 'ar': 'ar-SA', 'hi': 'hi-IN'
    };

    recognition.lang = state.sourceLang === 'auto' ? 'en-US' : (langMap[state.sourceLang] || 'en-US');

    recognition.onstart = () => {
        elements.micBtn.classList.add('recording');
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        elements.sourceInput.value = transcript;
        updateTextStats();
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        elements.micBtn.classList.remove('recording');
        if (event.error === 'not-allowed') {
            showToast('Microphone access denied', 'error');
        }
    };

    recognition.onend = () => {
        elements.micBtn.classList.remove('recording');
    };

    try {
        recognition.start();
    } catch (error) {
        console.error('Failed to start recognition:', error);
        elements.micBtn.classList.remove('recording');
    }
}

async function loadHistory() {
    try {
        const history = await getTranslationHistory(20);
        state.history = history;
        renderHistory();
    } catch (error) {
        console.error('Failed to load history:', error);
    }
}

async function loadFavorites() {
    try {
        const favorites = await getFavoriteTranslations();
        state.favorites = favorites;
        renderFavorites();
    } catch (error) {
        console.error('Failed to load favorites:', error);
    }
}

function renderHistory() {
    if (state.history.length === 0) {
        elements.historyList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">◉</div>
                <div>No history yet</div>
            </div>
        `;
        return;
    }

    elements.historyList.innerHTML = state.history.map(item => `
        <div class="history-item" data-id="${item.id}">
            <div class="item-lang">${getLangName(item.source_lang)} → ${getLangName(item.target_lang)}</div>
            <div class="item-text">${escapeHtml(item.source_text)}</div>
            <div class="item-translation">${escapeHtml(item.translated_text)}</div>
            <div class="item-footer">
                <span class="item-time">${formatTime(item.created_at)}</span>
                <div class="item-actions">
                    <button class="item-action-btn favorite-btn ${item.is_favorite ? 'favorite-active' : ''}" data-id="${item.id}" title="Favorite">
                        <svg fill="${item.is_favorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                    </button>
                    <button class="item-action-btn delete-btn" data-id="${item.id}" title="Delete">
                        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    attachHistoryListeners();
}

function renderFavorites() {
    if (state.favorites.length === 0) {
        elements.favoritesList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">★</div>
                <div>No favorites yet</div>
            </div>
        `;
        return;
    }

    elements.favoritesList.innerHTML = state.favorites.map(item => `
        <div class="favorite-item" data-id="${item.id}">
            <div class="item-lang">${getLangName(item.source_lang)} → ${getLangName(item.target_lang)}</div>
            <div class="item-text">${escapeHtml(item.source_text)}</div>
            <div class="item-translation">${escapeHtml(item.translated_text)}</div>
            <div class="item-footer">
                <span class="item-time">${formatTime(item.created_at)}</span>
                <div class="item-actions">
                    <button class="item-action-btn delete-btn" data-id="${item.id}" title="Delete">
                        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    attachFavoritesListeners();
}

function attachHistoryListeners() {
    document.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.closest('.item-action-btn')) return;

            const history = state.history.find(h => h.id === item.dataset.id);
            if (history) {
                elements.sourceInput.value = history.source_text;
                elements.translationOutput.textContent = history.translated_text;
                state.sourceLang = history.source_lang;
                state.targetLang = history.target_lang;
                elements.sourceLang.value = state.sourceLang;
                elements.targetLang.value = state.targetLang;
                state.currentTranslationId = history.id;
                updateTextStats();
                updateOutputStats();
                if (history.is_favorite) {
                    elements.favoriteBtn.classList.add('favorite-active');
                } else {
                    elements.favoriteBtn.classList.remove('favorite-active');
                }
            }
        });
    });

    document.querySelectorAll('.history-item .favorite-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const isFavorite = btn.classList.toggle('favorite-active');
            try {
                await toggleFavorite(id, isFavorite);
                await loadFavorites();
                await loadHistory();
            } catch (error) {
                console.error('Failed to toggle favorite:', error);
            }
        });
    });

    document.querySelectorAll('.history-item .delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            try {
                await deleteTranslation(id);
                await loadHistory();
                await loadFavorites();
                showToast('Deleted');
            } catch (error) {
                console.error('Failed to delete:', error);
            }
        });
    });
}

function attachFavoritesListeners() {
    document.querySelectorAll('.favorite-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.closest('.item-action-btn')) return;

            const favorite = state.favorites.find(f => f.id === item.dataset.id);
            if (favorite) {
                elements.sourceInput.value = favorite.source_text;
                elements.translationOutput.textContent = favorite.translated_text;
                state.sourceLang = favorite.source_lang;
                state.targetLang = favorite.target_lang;
                elements.sourceLang.value = state.sourceLang;
                elements.targetLang.value = state.targetLang;
                state.currentTranslationId = favorite.id;
                updateTextStats();
                updateOutputStats();
                elements.favoriteBtn.classList.add('favorite-active');
            }
        });
    });

    document.querySelectorAll('.favorite-item .delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            try {
                await deleteTranslation(id);
                await loadFavorites();
                await loadHistory();
                showToast('Deleted');
            } catch (error) {
                console.error('Failed to delete:', error);
            }
        });
    });
}

function getLangName(code) {
    const lang = languages.find(l => l.code === code);
    return lang ? lang.name : code;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}

function showToast(message, type = 'success') {
    elements.toastMessage.textContent = message;
    elements.toast.classList.add('show');

    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    const sunIcon = elements.themeBtn.querySelector('.sun-icon');
    const moonIcon = elements.themeBtn.querySelector('.moon-icon');

    if (newTheme === 'dark') {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    }
}

elements.sourceLang.addEventListener('change', () => {
    state.sourceLang = elements.sourceLang.value;
});

elements.targetLang.addEventListener('change', () => {
    state.targetLang = elements.targetLang.value;
});

elements.swapBtn.addEventListener('click', swapLanguages);

elements.sourceInput.addEventListener('input', () => {
    updateTextStats();
});

elements.sourceInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        translate();
    }
});

elements.translateBtn.addEventListener('click', translate);
elements.clearBtn.addEventListener('click', clearText);
elements.copyBtn.addEventListener('click', copyTranslation);
elements.speakBtn.addEventListener('click', speakTranslation);
elements.favoriteBtn.addEventListener('click', toggleFavoriteStatus);
elements.micBtn.addEventListener('click', startVoiceInput);
elements.themeBtn.addEventListener('click', toggleTheme);

elements.clearHistoryBtn.addEventListener('click', async () => {
    if (confirm('Clear all history?')) {
        for (const item of state.history) {
            await deleteTranslation(item.id);
        }
        await loadHistory();
        showToast('History cleared');
    }
});

elements.clearFavoritesBtn.addEventListener('click', async () => {
    if (confirm('Clear all favorites?')) {
        for (const item of state.favorites) {
            await toggleFavorite(item.id, false);
        }
        await loadFavorites();
        await loadHistory();
        showToast('Favorites cleared');
    }
});

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    elements.themeBtn.querySelector('.sun-icon').style.display = 'none';
    elements.themeBtn.querySelector('.moon-icon').style.display = 'block';
}

initLanguageSelectors();
loadHistory();
loadFavorites();
updateTextStats();
