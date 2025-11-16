import { supabase } from '../lib/supabase.js';

export async function saveTranslation(data) {
  const { data: { user } } = await supabase.auth.getUser();

  const translation = {
    user_id: user?.id || null,
    source_text: data.sourceText,
    translated_text: data.translatedText,
    source_lang: data.sourceLang,
    target_lang: data.targetLang,
    detected_lang: data.detectedLang || null,
    is_favorite: false
  };

  const { data: result, error } = await supabase
    .from('translations')
    .insert(translation)
    .select()
    .maybeSingle();

  if (error) throw error;
  return result;
}

export async function getTranslationHistory(limit = 50) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('translations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getFavoriteTranslations() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('translations')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_favorite', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function toggleFavorite(translationId, isFavorite) {
  const { error } = await supabase
    .from('translations')
    .update({ is_favorite: isFavorite })
    .eq('id', translationId);

  if (error) throw error;
}

export async function deleteTranslation(translationId) {
  const { error } = await supabase
    .from('translations')
    .delete()
    .eq('id', translationId);

  if (error) throw error;
}

export async function getUserPreferences() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function saveUserPreferences(preferences) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: user.id,
      ...preferences
    })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}
