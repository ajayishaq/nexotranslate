import { supabase } from '../lib/supabase.js';

const STORAGE_KEY = 'nexo_translations';
const FAVORITES_KEY = 'nexo_favorites';

function getLocalStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLocalStorage(translations) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(translations));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

function generateId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

export async function saveTranslation(data) {
  const translation = {
    id: generateId(),
    source_text: data.sourceText,
    translated_text: data.translatedText,
    source_lang: data.sourceLang,
    target_lang: data.targetLang,
    detected_lang: data.detectedLang || null,
    is_favorite: false,
    created_at: new Date().toISOString()
  };

  if (!supabase) {
    const translations = getLocalStorage();
    translations.unshift(translation);
    saveLocalStorage(translations);
    return translation;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    const result = {
      ...translation,
      user_id: user?.id || null
    };

    const { data: inserted, error } = await supabase
      .from('translations')
      .insert(result)
      .select()
      .maybeSingle();

    if (error) throw error;
    return inserted;
  } catch (err) {
    console.warn('Supabase save failed, using localStorage:', err);
    const translations = getLocalStorage();
    translations.unshift(translation);
    saveLocalStorage(translations);
    return translation;
  }
}

export async function getTranslationHistory(limit = 50) {
  if (!supabase) {
    return getLocalStorage().slice(0, limit);
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return getLocalStorage().slice(0, limit);

    const { data, error } = await supabase
      .from('translations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Supabase fetch failed, using localStorage:', err);
    return getLocalStorage().slice(0, limit);
  }
}

export async function getFavoriteTranslations() {
  if (!supabase) {
    return getLocalStorage().filter(t => t.is_favorite);
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return getLocalStorage().filter(t => t.is_favorite);

    const { data, error } = await supabase
      .from('translations')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_favorite', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Supabase fetch failed, using localStorage:', err);
    return getLocalStorage().filter(t => t.is_favorite);
  }
}

export async function toggleFavorite(translationId, isFavorite) {
  if (!supabase) {
    const translations = getLocalStorage();
    const idx = translations.findIndex(t => t.id === translationId);
    if (idx !== -1) {
      translations[idx].is_favorite = isFavorite;
      saveLocalStorage(translations);
    }
    return;
  }

  try {
    const { error } = await supabase
      .from('translations')
      .update({ is_favorite: isFavorite })
      .eq('id', translationId);

    if (error) throw error;
  } catch (err) {
    console.warn('Supabase update failed, using localStorage:', err);
    const translations = getLocalStorage();
    const idx = translations.findIndex(t => t.id === translationId);
    if (idx !== -1) {
      translations[idx].is_favorite = isFavorite;
      saveLocalStorage(translations);
    }
  }
}

export async function deleteTranslation(translationId) {
  if (!supabase) {
    const translations = getLocalStorage();
    const filtered = translations.filter(t => t.id !== translationId);
    saveLocalStorage(filtered);
    return;
  }

  try {
    const { error } = await supabase
      .from('translations')
      .delete()
      .eq('id', translationId);

    if (error) throw error;
  } catch (err) {
    console.warn('Supabase delete failed, using localStorage:', err);
    const translations = getLocalStorage();
    const filtered = translations.filter(t => t.id !== translationId);
    saveLocalStorage(filtered);
  }
}
