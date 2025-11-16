export function getWordCount(text) {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

export function getCharacterCount(text) {
  return text ? text.length : 0;
}

export function getSentenceCount(text) {
  if (!text || !text.trim()) return 0;
  const sentences = text.match(/[^.!?]+[.!?]+/g);
  return sentences ? sentences.length : 0;
}

export function estimateReadingTime(text, wordsPerMinute = 200) {
  const wordCount = getWordCount(text);
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return minutes;
}

export function formatTextStats(text) {
  const words = getWordCount(text);
  const chars = getCharacterCount(text);
  const sentences = getSentenceCount(text);
  const readingTime = estimateReadingTime(text);

  return {
    words,
    characters: chars,
    sentences,
    readingTime: readingTime > 0 ? `${readingTime} min` : '< 1 min'
  };
}
