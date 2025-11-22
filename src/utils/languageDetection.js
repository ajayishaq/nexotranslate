export function detectLanguageAdvanced(text) {
  if (!text || text.trim().length < 2) {
    return null;
  }

  const trimmedText = text.trim();

  const scriptPatterns = {
    'zh': { pattern: /[\u4e00-\u9fa5]/, name: 'Chinese' },
    'ja': { pattern: /[\u3040-\u309f\u30a0-\u30ff]/, name: 'Japanese' },
    'ko': { pattern: /[\uac00-\ud7af]/, name: 'Korean' },
    'ar': { pattern: /[\u0600-\u06ff]/, name: 'Arabic' },
    'he': { pattern: /[\u0590-\u05ff]/, name: 'Hebrew' },
    'ru': { pattern: /[\u0400-\u04ff]/, name: 'Russian' },
    'el': { pattern: /[\u0370-\u03ff]/, name: 'Greek' },
    'th': { pattern: /[\u0e00-\u0e7f]/, name: 'Thai' },
    'hi': { pattern: /[\u0900-\u097f]/, name: 'Hindi' },
    'bn': { pattern: /[\u0980-\u09ff]/, name: 'Bengali' },
    'ta': { pattern: /[\u0b80-\u0bff]/, name: 'Tamil' },
    'te': { pattern: /[\u0c00-\u0c7f]/, name: 'Telugu' },
    'kn': { pattern: /[\u0c80-\u0cff]/, name: 'Kannada' },
    'ml': { pattern: /[\u0d00-\u0d7f]/, name: 'Malayalam' }
  };

  for (const [code, data] of Object.entries(scriptPatterns)) {
    if (data.pattern.test(trimmedText)) {
      const matches = trimmedText.match(data.pattern);
      const confidence = Math.min((matches.length / trimmedText.length) * 2, 1);
      return { code, name: data.name, confidence: Math.max(confidence, 0.7) };
    }
  }

  const commonWords = {
    'en': {
      words: ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at'],
      name: 'English',
      threshold: 2
    },
    'es': {
      words: ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se', 'no', 'haber', 'por', 'con', 'su', 'para', 'como'],
      name: 'Spanish',
      threshold: 2
    },
    'fr': {
      words: ['le', 'de', 'un', 'être', 'et', 'à', 'il', 'avoir', 'ne', 'je', 'son', 'que', 'se', 'qui', 'ce', 'dans'],
      name: 'French',
      threshold: 2
    },
    'de': {
      words: ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich', 'des', 'auf', 'für', 'ist'],
      name: 'German',
      threshold: 2
    },
    'it': {
      words: ['di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'il', 'un', 'uno', 'una', 'lo', 'la', 'i', 'gli'],
      name: 'Italian',
      threshold: 2
    },
    'pt': {
      words: ['o', 'a', 'de', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'é', 'com', 'não', 'uma', 'os'],
      name: 'Portuguese',
      threshold: 2
    },
    'nl': {
      words: ['de', 'het', 'een', 'van', 'in', 'en', 'is', 'op', 'te', 'voor', 'aan', 'met', 'zijn', 'die'],
      name: 'Dutch',
      threshold: 2
    },
    'sv': {
      words: ['och', 'i', 'att', 'det', 'som', 'är', 'på', 'en', 'för', 'av', 'med', 'den', 'till'],
      name: 'Swedish',
      threshold: 2
    },
    'da': {
      words: ['og', 'i', 'af', 'til', 'en', 'at', 'det', 'er', 'som', 'på', 'den', 'for'],
      name: 'Danish',
      threshold: 2
    },
    'no': {
      words: ['og', 'i', 'av', 'til', 'en', 'å', 'på', 'som', 'det', 'er', 'for', 'med'],
      name: 'Norwegian',
      threshold: 2
    },
    'pl': {
      words: ['i', 'w', 'na', 'z', 'do', 'się', 'nie', 'że', 'a', 'o', 'jest', 'to', 'od'],
      name: 'Polish',
      threshold: 2
    },
    'ru': {
      words: ['и', 'в', 'не', 'на', 'что', 'то', 'он', 'она', 'это', 'а', 'с', 'по'],
      name: 'Russian',
      threshold: 2
    },
    'uk': {
      words: ['і', 'в', 'не', 'на', 'що', 'то', 'він', 'вона', 'це', 'а', 'з', 'по'],
      name: 'Ukrainian',
      threshold: 2
    },
    'tr': {
      words: ['ve', 'bir', 'bu', 'için', 'de', 'da', 'ile', 'mi', 'ne', 'ki', 'var', 'olan'],
      name: 'Turkish',
      threshold: 2
    }
  };

  const lowerText = trimmedText.toLowerCase();
  const words = lowerText.split(/\s+/);
  const scores = {};

  for (const [code, data] of Object.entries(commonWords)) {
    let matches = 0;
    for (const word of words) {
      if (data.words.includes(word.replace(/[^\w]/g, ''))) {
        matches++;
      }
    }
    
    if (matches >= data.threshold) {
      scores[code] = {
        name: data.name,
        confidence: Math.min(matches / words.length, 1)
      };
    }
  }

  if (Object.keys(scores).length > 0) {
    const bestMatch = Object.entries(scores).reduce((best, [code, data]) => {
      return data.confidence > best.confidence ? { code, ...data } : best;
    }, { code: null, confidence: 0 });

    if (bestMatch.code && bestMatch.confidence >= 0.15) {
      return { code: bestMatch.code, name: bestMatch.name, confidence: bestMatch.confidence };
    }
  }

  const latinPattern = /^[a-zA-Z\s\d.,!?;:'"()-]+$/;
  if (latinPattern.test(trimmedText)) {
    return { code: 'en', name: 'English', confidence: 0.6 };
  }

  return null;
}

export function getLanguageConfidenceLabel(confidence) {
  if (confidence >= 0.8) return 'High';
  if (confidence >= 0.5) return 'Medium';
  return 'Low';
}
