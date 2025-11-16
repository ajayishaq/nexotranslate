/*
  # Translation Application Schema

  1. New Tables
    - `translations`
      - `id` (uuid, primary key) - Unique identifier for each translation
      - `user_id` (uuid, nullable) - Optional user identifier for authenticated users
      - `source_text` (text) - Original text to translate
      - `translated_text` (text) - Translated result
      - `source_lang` (text) - Source language code
      - `target_lang` (text) - Target language code
      - `detected_lang` (text, nullable) - Auto-detected language if applicable
      - `is_favorite` (boolean) - Whether translation is favorited
      - `created_at` (timestamptz) - When translation was created
      - `updated_at` (timestamptz) - When translation was last updated

    - `user_preferences`
      - `id` (uuid, primary key) - Unique identifier
      - `user_id` (uuid, unique) - User identifier
      - `preferred_source_lang` (text) - User's preferred source language
      - `preferred_target_lang` (text) - User's preferred target language
      - `theme` (text) - UI theme preference (light/dark)
      - `auto_translate` (boolean) - Auto-translate on input
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on all tables
    - Users can only access their own translations and preferences
    - Anonymous users can create translations but cannot access history
    - Authenticated users have full CRUD access to their data

  3. Indexes
    - Index on user_id for fast lookups
    - Index on created_at for sorting recent translations
    - Index on is_favorite for filtering favorites
*/

-- Create translations table
CREATE TABLE IF NOT EXISTS translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  source_text text NOT NULL,
  translated_text text NOT NULL,
  source_lang text NOT NULL,
  target_lang text NOT NULL,
  detected_lang text,
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL,
  preferred_source_lang text DEFAULT 'auto',
  preferred_target_lang text DEFAULT 'en',
  theme text DEFAULT 'light',
  auto_translate boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_translations_user_id ON translations(user_id);
CREATE INDEX IF NOT EXISTS idx_translations_created_at ON translations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_translations_is_favorite ON translations(is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Enable Row Level Security
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Translations policies
CREATE POLICY "Anyone can create translations"
  ON translations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view their own translations"
  ON translations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own translations"
  ON translations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own translations"
  ON translations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_translations_updated_at ON translations;
CREATE TRIGGER update_translations_updated_at
  BEFORE UPDATE ON translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();