export const languagePatterns = {
  'zh': {
    pattern: /[\u4e00-\u9fa5]/,
    weight: 1,
    name: 'Chinese',
    commonChars: /[\u4e00-\u9fa5]{3,}/
  },
  'ja': {
    pattern: /[\u3040-\u309f\u30a0-\u30ff]/,
    weight: 1,
    name: 'Japanese',
    commonChars: /[\u3040-\u309f\u30a0-\u30ff]{2,}/
  },
  'ko': {
    pattern: /[\uac00-\ud7af]/,
    weight: 1,
    name: 'Korean',
    commonChars: /[\uac00-\ud7af]{2,}/
  },
  'ar': {
    pattern: /[\u0600-\u06ff]/,
    weight: 1,
    name: 'Arabic',
    commonChars: /[\u0600-\u06ff]{3,}/
  },
  'he': {
    pattern: /[\u0590-\u05ff]/,
    weight: 1,
    name: 'Hebrew',
    commonChars: /[\u0590-\u05ff]{3,}/
  },
  'ru': {
    pattern: /[\u0400-\u04ff]/,
    weight: 1,
    name: 'Russian',
    commonChars: /[\u0400-\u04ff]{3,}/
  },
  'el': {
    pattern: /[\u0370-\u03ff]/,
    weight: 1,
    name: 'Greek',
    commonChars: /[\u0370-\u03ff]{3,}/
  },
  'th': {
    pattern: /[\u0e00-\u0e7f]/,
    weight: 1,
    name: 'Thai',
    commonChars: /[\u0e00-\u0e7f]{3,}/
  },
  'hi': {
    pattern: /[\u0900-\u097f]/,
    weight: 1,
    name: 'Hindi',
    commonChars: /[\u0900-\u097f]{3,}/
  },
  'bn': {
    pattern: /[\u0980-\u09ff]/,
    weight: 1,
    name: 'Bengali',
    commonChars: /[\u0980-\u09ff]{3,}/
  },
  'ta': {
    pattern: /[\u0b80-\u0bff]/,
    weight: 1,
    name: 'Tamil',
    commonChars: /[\u0b80-\u0bff]{3,}/
  },
  'te': {
    pattern: /[\u0c00-\u0c7f]/,
    weight: 1,
    name: 'Telugu',
    commonChars: /[\u0c00-\u0c7f]{3,}/
  }
};

export const commonWords = {
  'es': {
    words: /\b(el|la|de|que|y|a|en|un|ser|se|no|haber|por|con|su|para|como|estar|tener|le|lo|todo|pero|más|hacer|o|poder|decir|este|ir|otro|ese|si|me|ya|ver|porque|dar|cuando|muy|sin|vez|mucho|saber|sobre|también|año|dos|entre|tiempo|día|uno|bien|poco|entonces|cosa|hombre|donde|parte|vida|nada|cada|menos|nuevo|algo|solo|volver|encontrar|llevar|llegar)\b/gi,
    threshold: 3,
    name: 'Spanish'
  },
  'fr': {
    words: /\b(le|de|un|être|et|à|il|avoir|ne|je|son|que|se|qui|ce|dans|en|du|elle|au|pour|pas|vous|par|sur|faire|plus|dire|me|on|mon|lui|nous|comme|mais|pouvoir|avec|tout|y|aller|voir|bien|où|sans|tu|ou|leur|si|deux|peu|donc|déjà|celui|jour|même|encore|aussi|heure|autre|chose|vers|monde|dont|fois|après|vie|sous|tant|contre|puis|temps|part|grand|prendre|main|point|arriver|vouloir|porter|tomber|reste|porte|jeune|trois|partir|moins)\b/gi,
    threshold: 3,
    name: 'French'
  },
  'de': {
    words: /\b(der|die|und|in|den|von|zu|das|mit|sich|des|auf|für|ist|im|dem|nicht|ein|eine|als|auch|es|an|werden|aus|er|hat|dass|sie|nach|wird|bei|um|am|sind|noch|wie|einem|über|so|zum|war|haben|nur|oder|aber|vor|zur|bis|mehr|durch|sein|wurde|sei|kann|gegen|vom|können|wenn|seine|dann|unter|wir|soll|ich|eines|jahr|zwei|diese|wieder|keine|neue|gibt|alle|wurden|ihrer|zeit|seit|ersten|heute|machen|seinen|worden|beide|ganz|erste|dazu|drei|weitere|beim|wohl|weg|jetzt|immer|bereits|lang|gehen|teil|viele)\b/gi,
    threshold: 3,
    name: 'German'
  },
  'it': {
    words: /\b(di|a|da|in|con|su|per|tra|il|un|uno|una|lo|la|i|gli|le|e|che|non|si|è|o|ci|mi|ho|sono|ha|sei|hanno|stato|fatto|essere|avere|fare|dire|andare|vedere|sapere|volere|venire|stare|dare|quando|anno|più|cosa|quello|bene|io|no|anche|tutto|altro|molto|ancora|mano|giorno|ora|grande|uomo|vita|prima|volta|noi|due|casa|mondo|parte|momento|donna|dopo|sempre|poi|tanto|suo|mio|così|stesso|tre|senza|mai|solo|sotto|sopra|oggi|quasi|nome|modo|occhi|certo|tutti|ogni|però|quattro|voce|testa|nuovo|fuori|sera|cuore|padre|punto|terra|invece)\b/gi,
    threshold: 3,
    name: 'Italian'
  },
  'pt': {
    words: /\b(o|a|de|que|e|do|da|em|um|para|é|com|não|uma|os|no|se|na|por|mais|as|dos|como|mas|foi|ao|ele|das|tem|à|seu|sua|ou|ser|quando|muito|há|nos|já|está|eu|também|só|pelo|pela|até|isso|ela|entre|era|depois|sem|mesmo|aos|ter|seus|quem|nas|me|esse|eles|você|tinha|foram|essa|num|nem|suas|meu|às|minha|têm|numa|pelos|elas|havia|seja|qual|será|nós|tenho|lhe|deles|essas|esses|pelas|este|fosse|dele|tudo|ainda|fazer|pode|maior|sobre|todos|onde|anos|outro|meio|menos|desde|isso|parte|dar|nunca|pois|algum)\b/gi,
    threshold: 3,
    name: 'Portuguese'
  },
  'nl': {
    words: /\b(de|het|een|van|in|en|is|op|te|voor|aan|met|zijn|die|dat|er|ook|als|maar|om|niet|tot|uit|bij|door|over|ze|dan|kan|hij|naar|was|wat|worden|meer|heeft|moet|deze|daar|nog|wie|andere|hun|nu|alle|tegen|na|twee|onder|geen|wel|veel|zo|dus|komt|dit|zeer|jaar|kunnen|hebben|haar|zou|heeft|drie|omdat|want|grote|werd|laten|moeten|altijd|maken|waar|zelf|doen|eigen|werd|gaan|eerste|nieuwe|groot|plaats)\b/gi,
    threshold: 3,
    name: 'Dutch'
  },
  'pl': {
    words: /\b(i|w|na|z|do|się|nie|że|a|o|jest|to|od|po|przez|co|jak|ale|być|który|za|dla|czy|tylko|już|tym|jej|jego|przy|lub|też|oraz|ten|może|więc|bardzo|wszystko|jeszcze|można|bo|tak|gdzie|kiedy|pod|nad|przed|bez|roku|lat|ze|byli|miał|gdy|został|czyli|trzeba|więcej|sam|kilka|swój|sobie|wśród|zawsze|nawet|żeby|ktoś|sposób|niż|dziś|jakie|każdy|tam|raz|jedno|taki|dobry|nowy|wielki|ostatni|pierwszy|mały|będzie|wtedy|jakby|właśnie|jeszcze|czyli)\b/gi,
    threshold: 3,
    name: 'Polish'
  },
  'sv': {
    words: /\b(och|i|att|det|som|är|på|en|för|av|med|den|till|om|var|han|ett|har|inte|de|kan|man|men|vid|så|från|eller|hans|sin|nu|över|ska|hade|efter|honom|än|många|bara|år|skulle|ut|andra|dem|också|mellan|alla|vara|sedan|oss|mer|hennes|där|finns|blev|måste|dit|dock|sådan|denna|under|sig|mycket|dag|kommer|ingen|enligt|någon|blivit|dessa|än|hela|första|här|varit|får|fram|varje|utan|emot|stora)\b/gi,
    threshold: 3,
    name: 'Swedish'
  },
  'da': {
    words: /\b(og|i|af|til|en|at|det|er|som|på|den|for|med|han|var|de|ikke|har|om|et|fra|men|ved|over|efter|op|hun|kan|blive|skal|blive|da|bare|ud|her|end|denne|dem|dig|dog|bliver|blevet|andre|sig|meget|deres|alle|eller|når|noget|være|mellem|hans|sine|under|både|skulle|inden|hvor|nu|også|fik|hendes|godt|hele|hele|helt|selv|min|derfor|uden|særlig|før|tilbage|gør|får|lidt|samme|først|ingen|store|alle)\b/gi,
    threshold: 3,
    name: 'Danish'
  },
  'no': {
    words: /\b(og|i|av|til|en|å|på|som|det|er|for|med|den|var|at|han|ikke|har|de|om|et|fra|men|ved|over|etter|opp|hun|kan|bli|skal|da|bare|ut|her|enn|denne|dem|deg|dog|blir|blitt|andre|seg|meget|deres|alle|eller|når|noe|være|mellom|hans|sine|under|både|skulle|innen|hvor|nå|også|fikk|hennes|godt|hele|helt|selv|min|derfor|uten|før|tilbake|gjør|får|litt|samme|først|ingen|store|alle)\b/gi,
    threshold: 3,
    name: 'Norwegian'
  },
  'tr': {
    words: /\b(bir|ve|bu|için|de|da|ile|mi|ne|ki|daha|çok|olan|var|gibi|ben|sen|o|biz|siz|onlar|mı|mü|ama|ancak|veya|yani|çünkü|eğer|şey|zaman|sonra|kadar|en|bile|diye|nasıl|neden|niçin|nerede|nereden|nereye|hangi|kim|kime|kimi|ne|neyi|şu|öyle|böyle|her|hiç|bazı|birkaç|tüm|bütün|hep|artık|daha|çok|az|pek|oldukça|hem|ya|ise|sadece)\b/gi,
    threshold: 3,
    name: 'Turkish'
  }
};

export function detectLanguageAdvanced(text) {
  if (!text || text.trim().length < 3) {
    return null;
  }

  const trimmedText = text.trim();

  for (const [code, data] of Object.entries(languagePatterns)) {
    if (data.commonChars && data.commonChars.test(trimmedText)) {
      const matches = trimmedText.match(data.pattern);
      const percentage = matches ? (matches.length / trimmedText.length) * 100 : 0;

      if (percentage > 15) {
        return { code, name: data.name, confidence: Math.min(percentage / 50, 1) };
      }
    }
  }

  const scores = {};
  for (const [code, data] of Object.entries(commonWords)) {
    const matches = trimmedText.match(data.words);
    if (matches && matches.length >= data.threshold) {
      const uniqueMatches = new Set(matches.map(m => m.toLowerCase()));
      scores[code] = {
        score: uniqueMatches.size,
        name: data.name,
        confidence: Math.min(uniqueMatches.size / 10, 1)
      };
    }
  }

  if (Object.keys(scores).length > 0) {
    const bestMatch = Object.entries(scores).reduce((best, [code, data]) => {
      return data.score > best.score ? { code, ...data } : best;
    }, { score: 0, code: null });

    if (bestMatch.code) {
      return { code: bestMatch.code, name: bestMatch.name, confidence: bestMatch.confidence };
    }
  }

  const latinPattern = /^[a-zA-Z\s\d.,!?;:'"()-]+$/;
  if (latinPattern.test(trimmedText)) {
    return { code: 'en', name: 'English', confidence: 0.5 };
  }

  return null;
}

export function getLanguageConfidenceLabel(confidence) {
  if (confidence >= 0.8) return 'High';
  if (confidence >= 0.5) return 'Medium';
  return 'Low';
}
