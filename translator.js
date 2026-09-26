// Universal German Grammatical & Translation Engine
class GermanGrammarEngine {
  static FEM_SUFFIXES = [
    'ung', 'ungen', 'heit', 'heiten', 'keit', 'keiten', 'schaft', 'schaften',
    'tät', 'täten', 'taet', 'taeten', 'tion', 'tionen', 'sion', 'sionen',
    'ur', 'uren', 'ik', 'iken', 'ie', 'ien', 'ei', 'eien',
    'anz', 'anzen', 'enz', 'enzen', 'ade', 'age', 'ette', 'ine', 'ive',
    'schrift', 'schriften', 'kunft', 'künfte', 'kuenfte', 'sicht', 'sichten',
    'nahme', 'nahmen', 'suche', 'suchen', 'wahl', 'wahlen', 'fahrt', 'fahrten',
    'frage', 'fragen', 'kraft', 'kräfte', 'kraefte', 'last', 'lasten',
    'macht', 'mächte', 'maechte', 'nacht', 'nächte', 'pflicht', 'pflichten',
    'rast', 'schicht', 'schichten', 'schlacht', 'schlachten', 'sucht', 'suchten',
    'tat', 'taten', 'tracht', 'wacht', 'welt', 'welten', 'zeit', 'zeiten', 'zahl', 'zahlen',
    'nachricht', 'nachrichten', 'erlaubnis', 'kenntnis', 'kenntnisse'
  ];

  static MASC_SUFFIXES = [
    'ismus', 'ismen', 'ling', 'linge', 'or', 'oren', 'ant', 'anten', 'ent', 'enten',
    'ist', 'isten', 'eur', 'eure', 'ast', 'ich', 'ig', 'ner', 'ler',
    'tag', 'tage', 'monat', 'monate', 'fall', 'fälle', 'faelle', 'gang', 'gänge', 'gaenge',
    'lauf', 'läufe', 'laeufe', 'satz', 'sätze', 'saetze', 'stand', 'stände', 'staende',
    'stein', 'steine', 'strom', 'ströme', 'stroeme', 'teil', 'teile', 'trieb', 'triebe',
    'weg', 'wege', 'zug', 'züge', 'zuege', 'trag', 'träge', 'traege', 'halt', 'druck',
    'bau', 'schlag', 'schläge', 'schlaege', 'brand', 'brände', 'braende',
    'blick', 'blicke', 'klang', 'klänge', 'klaenge', 'spruch', 'sprüche', 'sprueche',
    'schluss', 'schlüsse', 'schluesse', 'schein', 'scheine', 'schatz', 'schätze', 'schaetze'
  ];

  static NEUT_SUFFIXES = [
    'chen', 'lein', 'ment', 'mente', 'um', 'tum', 'tümer', 'tuemer', 'ma',
    'nis', 'nisse', 'sal', 'sale', 'sel', 'zeug', 'zeuge', 'gut', 'güter', 'gueter',
    'haus', 'häuser', 'haeuser', 'land', 'länder', 'laender', 'spiel', 'spiele',
    'werk', 'werke', 'stück', 'stücke', 'stueck', 'stuecke', 'jahr', 'jahre',
    'buch', 'bücher', 'buecher', 'bild', 'bilder', 'wort', 'wörter', 'woerter',
    'tier', 'tiere', 'glied', 'glieder', 'feld', 'felder', 'recht', 'rechte',
    'ziel', 'ziele', 'volk', 'völker', 'voelker', 'meer', 'meere', 'netz', 'netze',
    'haar', 'haare', 'auge', 'augen', 'ohr', 'ohren', 'dorf', 'dörfer', 'doerfer',
    'glas', 'gläser', 'glaeser', 'schloss', 'schlösser', 'schloesser'
  ];

  static KNOWN_VERB_ROOTS = new Set([
    'erlangen', 'beherrschen', 'entwickeln', 'verstehen', 'ermöglichen', 'erreichen',
    'entdecken', 'beachten', 'erklären', 'unterschreiben', 'lösen', 'können', 'müssen',
    'wollen', 'sollen', 'dürfen', 'machen', 'gehen', 'laufen', 'sehen', 'hören',
    'schreiben', 'lesen', 'lernen', 'sprechen', 'arbeiten', 'denken', 'bringen',
    'finden', 'geben', 'halten', 'lassen', 'nehmen', 'setzen', 'stehen', 'stellen',
    'zeigen', 'bleiben', 'liegen', 'führen', 'gehören', 'gewinnen', 'kennen',
    'versuchen', 'beginnen', 'brauchen', 'erzählen', 'leben', 'meinen', 'spielen',
    'wohnen', 'ziehen', 'bedeuten', 'bitten', 'folgen', 'hoffen', 'interessieren',
    'passen', 'reisen', 'stimmen', 'treffen', 'warten', 'wünschen', 'zahlen',
    'akzeptieren', 'informieren', 'organisieren', 'studieren', 'trainieren', 'gewährleisten',
    'überprüfen', 'verbessern', 'verringern', 'verhindern', 'steigern', 'sinken', 'steigen',
    'begleichen', 'tilgen', 'bedienen', 'erfüllen', 'kontrollieren', 'berücksichtigen'
  ]);

  static analyze(rawWord, offlineDef = null) {
    if (!rawWord || rawWord.trim().length < 2) {
      return { gender: null, pos: 'word' };
    }

    const word = rawWord.trim();
    const lower = word.toLowerCase();
    const isCapitalized = word[0] === word[0].toUpperCase() && word[0] !== word[0].toLowerCase();

    // 1. Direct Dictionary Priority
    if (offlineDef) {
      if (offlineDef.pos && (offlineDef.pos.includes('verb') || offlineDef.pos.includes('adj') || offlineDef.pos.includes('adv'))) {
        return { gender: null, pos: offlineDef.pos };
      }
      if (offlineDef.gender) {
        return { gender: offlineDef.gender, pos: offlineDef.pos || 'noun' };
      }
    }

    // 2. Strict Verb Check (NO article for verbs!)
    if (this.KNOWN_VERB_ROOTS.has(lower)) {
      return { gender: null, pos: 'verb' };
    }

    const verbPrefixes = ['be', 'ge', 'er', 'ver', 'zer', 'ent', 'emp', 'miss', 'ab', 'an', 'auf', 'aus', 'ein', 'vor', 'mit', 'zu', 'über', 'unter', 'durch'];
    const hasVerbPrefix = verbPrefixes.some(p => lower.startsWith(p));
    
    if ((!isCapitalized || hasVerbPrefix) && (lower.endsWith('en') || lower.endsWith('eln') || lower.endsWith('ern') || lower.endsWith('iert') || lower.endsWith('ieren') || lower.endsWith('test') || lower.endsWith('tet') || lower.endsWith('ten'))) {
      if (!this.FEM_SUFFIXES.some(s => lower.endsWith(s)) && !this.NEUT_SUFFIXES.some(s => lower.endsWith(s))) {
        if (!isCapitalized || hasVerbPrefix) {
          return { gender: null, pos: 'verb' };
        }
      }
    }

    // 3. Adjective Check (NO article for adjectives!)
    const adjSuffixes = ['lich', 'liche', 'lichen', 'licher', 'liches', 'ig', 'ige', 'igen', 'iger', 'iges', 'isch', 'ische', 'ischen', 'ischer', 'isches', 'bar', 'bare', 'baren', 'barere', 'sam', 'same', 'samen', 'haft', 'hafte', 'haften', 'los', 'lose', 'losen', 'voll', 'volle', 'vollen', 'wert', 'ste', 'sten', 'ster', 'stes'];
    if (adjSuffixes.some(s => lower.endsWith(s))) {
      if (!this.FEM_SUFFIXES.some(s => lower.endsWith(s)) || lower.endsWith('lich') || lower.endsWith('liche') || lower.endsWith('lichen')) {
        return { gender: null, pos: 'adjective' };
      }
    }

    if (!isCapitalized) {
      return { gender: null, pos: 'word' };
    }

    // 4. Universal Noun Suffix Taxonomy
    if (this.FEM_SUFFIXES.some(s => lower.endsWith(s))) {
      return { gender: 'die (fem)', pos: 'noun' };
    }

    if (this.MASC_SUFFIXES.some(s => lower.endsWith(s))) {
      return { gender: 'der (masc)', pos: 'noun' };
    }

    if (this.NEUT_SUFFIXES.some(s => lower.endsWith(s))) {
      return { gender: 'das (neut)', pos: 'noun' };
    }

    if (lower.startsWith('ge') && lower.length > 4) {
      if (lower.endsWith('e') || ['gesetz', 'geschäft', 'gespräch', 'gefühl', 'gewicht', 'gericht', 'gesicht', 'gepäck', 'geschenk', 'gebäude', 'gelände', 'gemälde', 'gebirge', 'gemüse'].includes(lower)) {
        return { gender: 'das (neut)', pos: 'noun' };
      }
    }

    if (lower.endsWith('er') || lower.endsWith('ern')) {
      return { gender: 'der (masc)', pos: 'noun' };
    }

    if (lower.endsWith('e') && !lower.startsWith('ge')) {
      return { gender: 'die (fem)', pos: 'noun' };
    }

    return { gender: null, pos: 'noun' };
  }
}

class GermanTranslator {
  constructor() {
    this.cache = this.loadCache();
    this.dictionary = window.GERMAN_DICTIONARY || {};
  }

  loadCache() {
    try {
      const saved = localStorage.getItem('german_trans_cache');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  }

  saveCache() {
    try {
      localStorage.setItem('german_trans_cache', JSON.stringify(this.cache));
    } catch (e) {
      console.warn('Translation cache storage failed', e);
    }
  }

  // Clean word: remove quotes, footnote numbers, soft hyphens, brackets
  cleanWord(text) {
    if (!text) return '';
    return text.toString().trim()
      .replace(/[­​﻿]/g, '') // Remove soft hyphens and zero-width spaces
      .replace(/^[«»"„“'\(\)\[\]\{\}.,:;!?¿¡\-–—0-9]+|[«»"„“'\(\)\[\]\{\}.,:;!?¿¡\-–—0-9]+$/g, '')
      .trim();
  }

  decodeHtml(html) {
    if (!html) return '';
    return html
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&auml;/g, 'ä')
      .replace(/&ouml;/g, 'ö')
      .replace(/&uuml;/g, 'ü')
      .replace(/&szlig;/g, 'ß')
      .replace(/&Auml;/g, 'Ä')
      .replace(/&Ouml;/g, 'Ö')
      .replace(/&Uuml;/g, 'Ü');
  }

  detectGenderHeuristic(word, offlineDef = null) {
    return GermanGrammarEngine.analyze(word, offlineDef).gender;
  }

  // Smart Decompounder: Splits compound nouns into constituent roots
  decompoundWord(word) {
    if (!word || word.length < 6) return null;
    const lower = word.toLowerCase();

    for (let i = 3; i <= word.length - 3; i++) {
      let part1 = lower.slice(0, i);
      let part2 = lower.slice(i);

      let part1Clean = part1;
      if (part1.endsWith('s') && !part1.endsWith('ss')) part1Clean = part1.slice(0, -1);
      if (part1.endsWith('es')) part1Clean = part1.slice(0, -2);
      if (part1.endsWith('en')) part1Clean = part1.slice(0, -2);

      const def1 = this.lookupOffline(part1) || this.lookupOffline(part1Clean);
      const def2 = this.lookupOffline(part2);

      if (def1 && def2) {
        const analysis2 = GermanGrammarEngine.analyze(part2, def2);
        return {
          compound: true,
          part1: { text: part1Clean, en: def1.en },
          part2: { text: part2, en: def2.en },
          gender: def2.gender || analysis2.gender,
          pos: 'compound noun'
        };
      }
    }

    const analysis = GermanGrammarEngine.analyze(word);
    if (analysis.gender) {
      return {
        compound: true,
        gender: analysis.gender,
        pos: analysis.pos
      };
    }

    return null;
  }

  lookupOffline(cleanWord) {
    if (!cleanWord) return null;
    const raw = cleanWord.trim();
    const lower = raw.toLowerCase();
    const capitalized = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();

    // 1. Exact matches
    if (this.dictionary[raw]) return this.dictionary[raw];
    if (this.dictionary[capitalized]) return this.dictionary[capitalized];
    if (this.dictionary[lower]) return this.dictionary[lower];

    // 2. Common Irregular Past / Participle mappings for instant 0ms lookup
    const IRREGULAR_VERBS = {
      'ging': 'gehen', 'gingen': 'gehen', 'gingst': 'gehen', 'gegangen': 'gehen',
      'stand': 'stehen', 'standen': 'stehen', 'gestanden': 'stehen',
      'sprach': 'sprechen', 'sprachen': 'sprechen', 'gesprochen': 'sprechen',
      'fuhr': 'fahren', 'fuhren': 'fahren', 'gefahren': 'fahren',
      'sah': 'sehen', 'sahen': 'sehen', 'gesehen': 'sehen',
      'schrieb': 'schreiben', 'schrieben': 'schreiben', 'geschrieben': 'schreiben',
      'nahm': 'nehmen', 'nahmen': 'nehmen', 'genommen': 'nehmen',
      'gab': 'geben', 'gaben': 'geben', 'gegeben': 'geben',
      'fand': 'finden', 'fanden': 'finden', 'gefunden': 'finden',
      'wusste': 'wissen', 'wussten': 'wissen', 'gewusst': 'wissen',
      'kam': 'kommen', 'kamen': 'kommen', 'gekommen': 'kommen',
      'hatte': 'haben', 'hatten': 'haben', 'gehabt': 'haben',
      'war': 'sein', 'waren': 'sein', 'gewesen': 'sein',
      'konnte': 'können', 'konnten': 'können', 'gekonnt': 'können',
      'musste': 'müssen', 'mussten': 'müssen', 'gemusst': 'müssen',
      'wollte': 'wollen', 'wollten': 'wollen', 'gewollt': 'wollen',
      'sollte': 'sollten', 'sollten': 'sollen',
      'durfte': 'dürfen', 'durften': 'dürfen',
      'ließ': 'lassen', 'liessen': 'lassen', 'gelassen': 'lassen',
      'dachte': 'denken', 'dachten': 'denken', 'gedacht': 'denken',
      'brachte': 'bringen', 'brachten': 'bringen', 'gebracht': 'bringen',
      'trug': 'tragen', 'trugen': 'tragen', 'getragen': 'tragen',
      'zog': 'ziehen', 'zogen': 'ziehen', 'gezogen': 'ziehen',
      'blieb': 'bleiben', 'blieben': 'bleiben', 'geblieben': 'bleiben',
      'hielt': 'halten', 'hielten': 'halten', 'gehalten': 'halten',
      'schnitt': 'schneiden', 'schnitten': 'schneiden', 'geschnitten': 'schneiden',
      'fiel': 'fallen', 'fielen': 'fallen', 'gefallen': 'fallen',
      'lief': 'laufen', 'liefen': 'laufen', 'gelaufen': 'laufen'
    };

    if (IRREGULAR_VERBS[lower]) {
      const baseKey = IRREGULAR_VERBS[lower];
      if (this.dictionary[baseKey]) {
        const base = this.dictionary[baseKey];
        return { en: base.en, pos: 'verb', gender: null, lemma: baseKey };
      }
    }

    // 3. Regular Past / Participles (e.g. gemacht -> machen, gelernt -> lernen, gearbeitet -> arbeiten)
    if (lower.startsWith('ge') && (lower.endsWith('t') || lower.endsWith('te') || lower.endsWith('ten'))) {
      const stem = lower.replace(/^ge/, '').replace(/(test|tet|ten|te|t)$/, '');
      const infinitive1 = stem + 'en';
      const infinitive2 = stem + 'n';
      if (this.dictionary[infinitive1]) return { en: this.dictionary[infinitive1].en, pos: 'verb', gender: null, lemma: infinitive1 };
      if (this.dictionary[infinitive2]) return { en: this.dictionary[infinitive2].en, pos: 'verb', gender: null, lemma: infinitive2 };
    }

    // 4. Inflected Verb Endings (macht -> machen, lernst -> lernen, arbeitet -> arbeiten)
    const verbEndings = ['test', 'tet', 'ten', 'te', 'st', 't', 'e'];
    for (const vEnd of verbEndings) {
      if (lower.endsWith(vEnd) && lower.length - vEnd.length >= 3) {
        const stem = lower.slice(0, -vEnd.length);
        const cand1 = stem + 'en';
        const cand2 = stem + 'n';
        if (this.dictionary[cand1] && this.dictionary[cand1].pos && this.dictionary[cand1].pos.includes('verb')) {
          return { en: this.dictionary[cand1].en, pos: 'verb', gender: null, lemma: cand1 };
        }
        if (this.dictionary[cand2] && this.dictionary[cand2].pos && this.dictionary[cand2].pos.includes('verb')) {
          return { en: this.dictionary[cand2].en, pos: 'verb', gender: null, lemma: cand2 };
        }
      }
    }

    // 5. Morphological Lemmatization for Nouns & Adjectives
    const suffixes = ['ungen', 'ung', 'heiten', 'heit', 'keiten', 'keit', 'schaften', 'schaft', 'lichen', 'licher', 'liches', 'liche', 'lich', 'baren', 'barer', 'bares', 'bare', 'bar', 'iges', 'igen', 'iger', 'ige', 'ig', 'endes', 'enden', 'ender', 'ende', 'end', 'testen', 'tester', 'testes', 'teste', 'sten', 'ster', 'stes', 'ste', 'eren', 'erer', 'eres', 'ere', 'er', 'en', 'em', 'es', 'e', 's', 'n'];
    
    for (const suffix of suffixes) {
      if (lower.endsWith(suffix) && lower.length - suffix.length >= 3) {
        const stem = lower.slice(0, -suffix.length);
        const capStem = stem.charAt(0).toUpperCase() + stem.slice(1);

        if (this.dictionary[capStem]) {
          const base = this.dictionary[capStem];
          const analysis = GermanGrammarEngine.analyze(raw, base);
          return {
            en: base.en,
            pos: base.pos || analysis.pos,
            gender: base.gender || analysis.gender,
            lemma: capStem
          };
        }

        if (this.dictionary[stem]) {
          const base = this.dictionary[stem];
          const analysis = GermanGrammarEngine.analyze(raw, base);
          return {
            en: base.en,
            pos: base.pos || analysis.pos,
            gender: base.gender || analysis.gender,
            lemma: stem
          };
        }
      }
    }

    return null;
  }

  async translate(rawText) {
    const clean = this.cleanWord(rawText);
    if (!clean) return null;

    if (this.cache[clean]) {
      return this.cache[clean];
    }

    // 1. Instant Master Curated Dictionary & De-inflector Lookup (< 0.1ms)
    const offline = this.lookupOffline(clean);
    const grammar = GermanGrammarEngine.analyze(clean, offline);

    if (offline) {
      const res = {
        german: clean,
        english: offline.en,
        pos: offline.pos || grammar.pos,
        gender: offline.gender || grammar.gender,
        example: offline.ex || null,
        source: 'Curated Master Lexicon',
        synonyms: offline.syn || []
      };
      this.cache[clean] = res;
      this.saveCache();
      return res;
    }

    // 2. Fast Compound Word Decomposition
    const decomp = this.decompoundWord(clean);
    if (decomp && decomp.part1 && decomp.part2) {
      const res = {
        german: clean,
        english: `${decomp.part1.en} + ${decomp.part2.en}`,
        pos: decomp.pos,
        gender: decomp.gender,
        compoundDetails: `Compound: "${decomp.part1.text}" (${decomp.part1.en}) + "${decomp.part2.text}" (${decomp.part2.en})`,
        source: 'Compound Analyzer'
      };
      this.cache[clean] = res;
      this.saveCache();
      return res;
    }

    // 3. Ultra-Fast Parallel Online Fallback with 1.2s strict timeout
    try {
      let result = await this.fetchFastParallelTranslation(clean);
      if (result && result.english && result.english.trim().length > 0) {
        const onlineAnalysis = GermanGrammarEngine.analyze(clean);
        const res = {
          german: clean,
          english: result.english,
          pos: result.pos || onlineAnalysis.pos,
          gender: onlineAnalysis.gender,
          synonyms: result.synonyms || [],
          source: result.source || 'Neural Translate'
        };
        this.cache[clean] = res;
        this.saveCache();
        return res;
      }
    } catch (err) {
      console.warn('Online translation cascade finished with error:', err);
    }

    // 4. Safe Fallback
    const fallbackRes = {
      german: clean,
      english: clean,
      pos: grammar.pos,
      gender: grammar.gender,
      source: 'Direct Lookup'
    };
    return fallbackRes;
  }

  async fetchFastParallelTranslation(text) {
    const fetchWithTimeout = (url, timeoutMs = 1200) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      return fetch(url, { signal: controller.signal })
        .then(res => {
          clearTimeout(id);
          return res;
        })
        .catch(err => {
          clearTimeout(id);
          throw err;
        });
    };

    // Primary: Google GTX Fast Neural API
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=de&tl=en&dt=t&dt=bd&dt=rm&q=${encodeURIComponent(text)}`;
      const response = await fetchWithTimeout(url, 1400);
      if (response.ok) {
        const data = await response.json();
        let english = '';
        if (data && data[0]) {
          english = data[0].map(item => item[0]).filter(Boolean).join('');
        }

        let pos = null;
        let synonyms = [];
        if (data && data[1]) {
          data[1].forEach(entry => {
            const partOfSpeech = entry[0];
            const words = entry[1] || [];
            if (!pos) pos = partOfSpeech;
            synonyms.push({ pos: partOfSpeech, words: words.slice(0, 4) });
          });
        }

        if (english && english.trim().toLowerCase() !== text.toLowerCase()) {
          return {
            english: this.decodeHtml(english.trim()),
            pos: pos || 'word',
            synonyms: synonyms,
            source: 'Google Neural Translate'
          };
        }
      }
    } catch (e) {
      // Primary timed out or errored, proceed to backup
    }

    // Secondary Backup: MyMemory fast sanitized query
    try {
      const mmUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=de|en`;
      const resp = await fetchWithTimeout(mmUrl, 1200);
      if (resp.ok) {
        const json = await resp.json();
        if (json.responseData && json.responseData.translatedText) {
          const rawMeaning = this.decodeHtml(json.responseData.translatedText.trim());
          const isSingleWord = !text.includes(' ');
          const isNoisySentence = rawMeaning.toLowerCase().startsWith('i ') || rawMeaning.toLowerCase().startsWith('we ') || rawMeaning.includes('WARNING');
          
          if (!isSingleWord || (!isNoisySentence && rawMeaning.split(' ').length <= 4)) {
            if (rawMeaning.toLowerCase() !== text.toLowerCase()) {
              return {
                english: rawMeaning,
                pos: 'word',
                source: 'MyMemory Translate'
              };
            }
          }
        }
      }
    } catch (e) {
      // ignore
    }

    return null;
  }
}

// Universal German Morphology & Word Family Engine
class GermanMorphologyEngine {
  static INSEPARABLE_PREFIXES = ['be', 'ge', 'er', 'ver', 'zer', 'ent', 'emp', 'miss'];
  
  static SEPARABLE_PREFIXES = [
    'zusammen', 'herunter', 'zurück', 'weiter', 'voraus', 'hervor', 'bereit', 'nieder', 'vorbei', 'voran', 'empor',
    'fest', 'fort', 'nach', 'über', 'unter', 'durch', 'hinter', 'wieder', 'los', 'mit', 'vor', 'weg', 'aus', 'auf', 'bei', 'ein', 'her', 'hin', 'ab', 'an', 'um', 'zu'
  ];

  static SUFFIX_PATTERNS = [
    { suffix: 'ung', pos: 'noun', article: 'die', meaning: 'process / result of action' },
    { suffix: 'heit', pos: 'noun', article: 'die', meaning: 'state / condition' },
    { suffix: 'keit', pos: 'noun', article: 'die', meaning: 'quality / ability' },
    { suffix: 'schaft', pos: 'noun', article: 'die', meaning: 'collective / relationship' },
    { suffix: 'tät', pos: 'noun', article: 'die', meaning: 'concept / property' },
    { suffix: 'tion', pos: 'noun', article: 'die', meaning: 'action / category' },
    { suffix: 'nis', pos: 'noun', article: 'das', meaning: 'state / event' },
    { suffix: 'tum', pos: 'noun', article: 'das', meaning: 'domain / state' },
    { suffix: 'bar', pos: 'adjective', article: null, meaning: '-able / capability' },
    { suffix: 'lich', pos: 'adjective', article: null, meaning: '-ly / characteristic' },
    { suffix: 'ig', pos: 'adjective', article: null, meaning: '-y / having property' },
    { suffix: 'isch', pos: 'adjective', article: null, meaning: '-ic / origin' },
    { suffix: 'sam', pos: 'adjective', article: null, meaning: 'inclined to' },
    { suffix: 'haft', pos: 'adjective', article: null, meaning: 'having nature of' },
    { suffix: 'los', pos: 'adjective', article: null, meaning: '-less / without' },
    { suffix: 'voll', pos: 'adjective', article: null, meaning: '-ful / full of' },
    { suffix: 'er', pos: 'noun', article: 'der', meaning: 'agent / actor (masc)' },
    { suffix: 'in', pos: 'noun', article: 'die', meaning: 'agent / actor (fem)' }
  ];

  static ROOT_FAMILIES = {
  "deck": {
    "root": "deck",
    "base": "decken",
    "wordFamily": [
      {
        "word": "die Decke",
        "article": "die",
        "pos": "noun",
        "translation": "ceiling, blanket, cover"
      },
      {
        "word": "die Entdeckung",
        "article": "die",
        "pos": "noun",
        "translation": "discovery"
      },
      {
        "word": "der Entdecker",
        "article": "der",
        "pos": "noun",
        "translation": "discoverer, explorer"
      },
      {
        "word": "die Abdeckung",
        "article": "die",
        "pos": "noun",
        "translation": "cover, capping"
      },
      {
        "word": "bedeckt",
        "article": null,
        "pos": "adjective",
        "translation": "overcast, covered"
      }
    ],
    "prefixes": [
      {
        "word": "entdecken",
        "prefix": "ent-",
        "article": null,
        "pos": "verb",
        "translation": "to discover, find out"
      },
      {
        "word": "bedecken",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to cover, shroud"
      },
      {
        "word": "verdecken",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to conceal, hide"
      }
    ],
    "separableVerbs": [
      {
        "word": "abdecken",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to cover up, clear (table)"
      },
      {
        "word": "aufdecken",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to uncover, expose, reveal"
      },
      {
        "word": "zudecken",
        "prefix": "zu-",
        "article": null,
        "pos": "verb",
        "translation": "to cover over, tuck in"
      }
    ],
    "suffixes": [
      {
        "word": "die Entdeckung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "discovery"
      },
      {
        "word": "die Bedeckung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "coverage"
      }
    ]
  },
  "künst": {
    "root": "künst",
    "base": "künstlich",
    "wordFamily": [
      {
        "word": "die Kunst",
        "article": "die",
        "pos": "noun",
        "translation": "art, skill, craft"
      },
      {
        "word": "der Künstler",
        "article": "der",
        "pos": "noun",
        "translation": "artist"
      },
      {
        "word": "die Künstlerin",
        "article": "die",
        "pos": "noun",
        "translation": "female artist"
      },
      {
        "word": "künstlich",
        "article": null,
        "pos": "adjective",
        "translation": "artificial, synthetic"
      },
      {
        "word": "das Kunstwerk",
        "article": "das",
        "pos": "noun",
        "translation": "artwork, masterpiece"
      },
      {
        "word": "kunstvoll",
        "article": null,
        "pos": "adjective",
        "translation": "artful, elaborate"
      },
      {
        "word": "die Künstliche Intelligenz",
        "article": "die",
        "pos": "noun",
        "translation": "Artificial Intelligence (AI)"
      }
    ],
    "prefixes": [],
    "separableVerbs": [],
    "suffixes": [
      {
        "word": "künstlich",
        "suffix": "-lich",
        "article": null,
        "pos": "adjective",
        "translation": "artificial"
      },
      {
        "word": "die Künstlichkeit",
        "suffix": "-keit",
        "article": "die",
        "pos": "noun",
        "translation": "artificiality"
      }
    ]
  },
  "lern": {
    "root": "lern",
    "base": "lernen",
    "wordFamily": [
      {
        "word": "das Lernen",
        "article": "das",
        "pos": "noun",
        "translation": "learning, studying"
      },
      {
        "word": "der Lerner",
        "article": "der",
        "pos": "noun",
        "translation": "learner"
      },
      {
        "word": "die Lerngruppe",
        "article": "die",
        "pos": "noun",
        "translation": "study group"
      },
      {
        "word": "lernfähig",
        "article": null,
        "pos": "adjective",
        "translation": "capable of learning"
      },
      {
        "word": "die Lernfähigkeit",
        "article": "die",
        "pos": "noun",
        "translation": "learning capacity"
      }
    ],
    "prefixes": [
      {
        "word": "erlernen",
        "prefix": "er-",
        "article": null,
        "pos": "verb",
        "translation": "to master, acquire (language/skill)"
      },
      {
        "word": "verlernen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to forget (a skill)"
      }
    ],
    "separableVerbs": [
      {
        "word": "anlernen",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to train, teach basics"
      },
      {
        "word": "umlernen",
        "prefix": "um-",
        "article": null,
        "pos": "verb",
        "translation": "to relearn, change mindset"
      },
      {
        "word": "dazulernen",
        "prefix": "dazu-",
        "article": null,
        "pos": "verb",
        "translation": "to learn additional things"
      }
    ],
    "suffixes": [
      {
        "word": "lernbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "learnable"
      },
      {
        "word": "die Lernfähigkeit",
        "suffix": "-keit",
        "article": "die",
        "pos": "noun",
        "translation": "learning ability"
      }
    ]
  },
  "kenn": {
    "root": "kenn",
    "base": "kennen",
    "wordFamily": [
      {
        "word": "die Kenntnis",
        "article": "die",
        "pos": "noun",
        "translation": "knowledge, awareness"
      },
      {
        "word": "die Erkenntnis",
        "article": "die",
        "pos": "noun",
        "translation": "insight, realization"
      },
      {
        "word": "die Anerkennung",
        "article": "die",
        "pos": "noun",
        "translation": "recognition, appreciation"
      },
      {
        "word": "kenntnisreich",
        "article": null,
        "pos": "adjective",
        "translation": "knowledgeable"
      }
    ],
    "prefixes": [
      {
        "word": "erkennen",
        "prefix": "er-",
        "article": null,
        "pos": "verb",
        "translation": "to recognize, identify"
      },
      {
        "word": "anerkennen",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to acknowledge, recognize"
      },
      {
        "word": "bekennen",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to confess, admit"
      }
    ],
    "separableVerbs": [
      {
        "word": "auskennen",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to know one's way around, be expert in"
      }
    ],
    "suffixes": [
      {
        "word": "die Erkenntnis",
        "suffix": "-nis",
        "article": "die",
        "pos": "noun",
        "translation": "insight"
      },
      {
        "word": "kenntlich",
        "suffix": "-lich",
        "article": null,
        "pos": "adjective",
        "translation": "recognizable"
      }
    ]
  },
  "treff": {
    "root": "treff",
    "base": "treffen",
    "wordFamily": [
      {
        "word": "das Treffen",
        "article": "das",
        "pos": "noun",
        "translation": "meeting, gathering"
      },
      {
        "word": "der Treffpunkt",
        "article": "der",
        "pos": "noun",
        "translation": "meeting point"
      },
      {
        "word": "treffend",
        "article": null,
        "pos": "adjective",
        "translation": "apt, accurate"
      },
      {
        "word": "zutreffend",
        "article": null,
        "pos": "adjective",
        "translation": "applicable, true"
      },
      {
        "word": "betroffen",
        "article": null,
        "pos": "adjective",
        "translation": "affected, concerned"
      }
    ],
    "prefixes": [
      {
        "word": "betreffen",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to concern, relate to"
      },
      {
        "word": "übertreffen",
        "prefix": "über-",
        "article": null,
        "pos": "verb",
        "translation": "to exceed, surpass"
      }
    ],
    "separableVerbs": [
      {
        "word": "antreffen",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to encounter, find"
      },
      {
        "word": "eintreffen",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to arrive, come true"
      },
      {
        "word": "zutreffen",
        "prefix": "zu-",
        "article": null,
        "pos": "verb",
        "translation": "to apply, be accurate"
      }
    ],
    "suffixes": [
      {
        "word": "trefflich",
        "suffix": "-lich",
        "article": null,
        "pos": "adjective",
        "translation": "excellent"
      }
    ]
  },
  "folg": {
    "root": "folg",
    "base": "folgen",
    "wordFamily": [
      {
        "word": "der Erfolg",
        "article": "der",
        "pos": "noun",
        "translation": "success, achievement"
      },
      {
        "word": "die Folge",
        "article": "die",
        "pos": "noun",
        "translation": "consequence, episode"
      },
      {
        "word": "die Reihenfolge",
        "article": "die",
        "pos": "noun",
        "translation": "sequence, order"
      },
      {
        "word": "erfolgreich",
        "article": null,
        "pos": "adjective",
        "translation": "successful"
      },
      {
        "word": "erfolglos",
        "article": null,
        "pos": "adjective",
        "translation": "unsuccessful"
      },
      {
        "word": "folglich",
        "article": null,
        "pos": "adverb",
        "translation": "consequently"
      }
    ],
    "prefixes": [
      {
        "word": "befolgen",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to follow, obey (rules)"
      },
      {
        "word": "erfolgen",
        "prefix": "er-",
        "article": null,
        "pos": "verb",
        "translation": "to occur, take place"
      },
      {
        "word": "verfolgen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to pursue, track"
      }
    ],
    "separableVerbs": [
      {
        "word": "nachfolgen",
        "prefix": "nach-",
        "article": null,
        "pos": "verb",
        "translation": "to succeed, follow after"
      }
    ],
    "suffixes": [
      {
        "word": "die Verfolgung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "pursuit"
      },
      {
        "word": "erfolgreich",
        "suffix": "-reich",
        "article": null,
        "pos": "adjective",
        "translation": "successful"
      }
    ]
  },
  "herrsch": {
    "root": "herrsch",
    "base": "herrschen",
    "wordFamily": [
      {
        "word": "die Herrschaft",
        "article": "die",
        "pos": "noun",
        "translation": "rule, reign, dominance"
      },
      {
        "word": "die Beherrschung",
        "article": "die",
        "pos": "noun",
        "translation": "mastery, command"
      },
      {
        "word": "der Herrscher",
        "article": "der",
        "pos": "noun",
        "translation": "ruler"
      }
    ],
    "prefixes": [
      {
        "word": "beherrschen",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to master, command, dominate"
      }
    ],
    "separableVerbs": [
      {
        "word": "vorherrschen",
        "prefix": "vor-",
        "article": null,
        "pos": "verb",
        "translation": "to predominate, prevail"
      }
    ],
    "suffixes": [
      {
        "word": "die Beherrschung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "mastery"
      },
      {
        "word": "beherrschbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "manageable"
      }
    ]
  },
  "duld": {
    "root": "duld",
    "base": "dulden",
    "wordFamily": [
      {
        "word": "die Geduld",
        "article": "die",
        "pos": "noun",
        "translation": "patience, endurance"
      },
      {
        "word": "geduldig",
        "article": null,
        "pos": "adjective",
        "translation": "patient"
      },
      {
        "word": "ungeduldig",
        "article": null,
        "pos": "adjective",
        "translation": "impatient"
      },
      {
        "word": "die Ungeduld",
        "article": "die",
        "pos": "noun",
        "translation": "impatience"
      }
    ],
    "prefixes": [
      {
        "word": "erdulden",
        "prefix": "er-",
        "article": null,
        "pos": "verb",
        "translation": "to endure, bear"
      }
    ],
    "separableVerbs": [],
    "suffixes": [
      {
        "word": "geduldig",
        "suffix": "-ig",
        "article": null,
        "pos": "adjective",
        "translation": "patient"
      }
    ]
  },
  "öffn": {
    "root": "öffn",
    "base": "öffnen",
    "wordFamily": [
      {
        "word": "die Öffnung",
        "article": "die",
        "pos": "noun",
        "translation": "opening, aperture"
      },
      {
        "word": "die Eröffnung",
        "article": "die",
        "pos": "noun",
        "translation": "inauguration, opening"
      },
      {
        "word": "öffentlich",
        "article": null,
        "pos": "adjective",
        "translation": "public"
      },
      {
        "word": "die Öffentlichkeit",
        "article": "die",
        "pos": "noun",
        "translation": "the public"
      }
    ],
    "prefixes": [
      {
        "word": "eröffnen",
        "prefix": "er-",
        "article": null,
        "pos": "verb",
        "translation": "to open, disclose, launch"
      }
    ],
    "separableVerbs": [],
    "suffixes": [
      {
        "word": "die Eröffnung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "opening"
      },
      {
        "word": "öffentlich",
        "suffix": "-lich",
        "article": null,
        "pos": "adjective",
        "translation": "public"
      }
    ]
  },
  "trau": {
    "root": "trau",
    "base": "trauen",
    "wordFamily": [
      {
        "word": "das Vertrauen",
        "article": "das",
        "pos": "noun",
        "translation": "trust, confidence"
      },
      {
        "word": "das Selbstvertrauen",
        "article": "das",
        "pos": "noun",
        "translation": "self-confidence"
      },
      {
        "word": "das Misstrauen",
        "article": "das",
        "pos": "noun",
        "translation": "distrust"
      },
      {
        "word": "vertraulich",
        "article": null,
        "pos": "adjective",
        "translation": "confidential"
      }
    ],
    "prefixes": [
      {
        "word": "vertrauen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to trust, rely upon"
      },
      {
        "word": "misstrauen",
        "prefix": "miss-",
        "article": null,
        "pos": "verb",
        "translation": "to distrust"
      }
    ],
    "separableVerbs": [
      {
        "word": "zutrauen",
        "prefix": "zu-",
        "article": null,
        "pos": "verb",
        "translation": "to believe capable of"
      }
    ],
    "suffixes": [
      {
        "word": "vertraulich",
        "suffix": "-lich",
        "article": null,
        "pos": "adjective",
        "translation": "confidential"
      }
    ]
  },
  "seh": {
    "root": "seh",
    "base": "sehen",
    "wordFamily": [
      {
        "word": "die Sicht",
        "article": "die",
        "pos": "noun",
        "translation": "view, sight, perspective"
      },
      {
        "word": "das Aussehen",
        "article": "das",
        "pos": "noun",
        "translation": "appearance, look"
      },
      {
        "word": "die Absicht",
        "article": "die",
        "pos": "noun",
        "translation": "intention, purpose"
      },
      {
        "word": "die Übersicht",
        "article": "die",
        "pos": "noun",
        "translation": "overview, survey"
      },
      {
        "word": "der Fernseher",
        "article": "der",
        "pos": "noun",
        "translation": "TV set"
      },
      {
        "word": "sichtlich",
        "article": null,
        "pos": "adjective",
        "translation": "visible, evident"
      },
      {
        "word": "ansehnlich",
        "article": null,
        "pos": "adjective",
        "translation": "handsome, considerable"
      }
    ],
    "prefixes": [
      {
        "word": "versehen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to provide, make a mistake (sich)"
      },
      {
        "word": "ersehen",
        "prefix": "er-",
        "article": null,
        "pos": "verb",
        "translation": "to gather from, see from"
      },
      {
        "word": "übersehen",
        "prefix": "über-",
        "article": null,
        "pos": "verb",
        "translation": "to overlook, miss"
      }
    ],
    "separableVerbs": [
      {
        "word": "ansehen",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to look at, watch, regard"
      },
      {
        "word": "aussehen",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to look like, appear"
      },
      {
        "word": "aufsehen",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to look up (to)"
      },
      {
        "word": "einsehen",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to inspect, understand, realize"
      },
      {
        "word": "fernsehen",
        "prefix": "fern-",
        "article": null,
        "pos": "verb",
        "translation": "to watch television"
      },
      {
        "word": "nachsehen",
        "prefix": "nach-",
        "article": null,
        "pos": "verb",
        "translation": "to check, look up, forgive"
      },
      {
        "word": "vorsehen",
        "prefix": "vor-",
        "article": null,
        "pos": "verb",
        "translation": "to plan, designate, provide for"
      },
      {
        "word": "wegsehen",
        "prefix": "weg-",
        "article": null,
        "pos": "verb",
        "translation": "to look away"
      },
      {
        "word": "zusehen",
        "prefix": "zu-",
        "article": null,
        "pos": "verb",
        "translation": "to watch, witness, ensure"
      }
    ],
    "suffixes": [
      {
        "word": "sichtlich",
        "suffix": "-lich",
        "article": null,
        "pos": "adjective",
        "translation": "clearly, visibly"
      },
      {
        "word": "die Sichtbarkeit",
        "suffix": "-keit",
        "article": "die",
        "pos": "noun",
        "translation": "visibility"
      }
    ]
  },
  "geb": {
    "root": "geb",
    "base": "geben",
    "wordFamily": [
      {
        "word": "die Aufgabe",
        "article": "die",
        "pos": "noun",
        "translation": "task, exercise, surrender"
      },
      {
        "word": "die Angabe",
        "article": "die",
        "pos": "noun",
        "translation": "specification, statement"
      },
      {
        "word": "die Ausgabe",
        "article": "die",
        "pos": "noun",
        "translation": "edition, expense, output"
      },
      {
        "word": "das Ergebnis",
        "article": "das",
        "pos": "noun",
        "translation": "result, outcome"
      },
      {
        "word": "die Umgebung",
        "article": "die",
        "pos": "noun",
        "translation": "surroundings, environment"
      },
      {
        "word": "das Angebot",
        "article": "das",
        "pos": "noun",
        "translation": "offer, supply"
      },
      {
        "word": "ergeben",
        "article": null,
        "pos": "adjective",
        "translation": "devoted, yielding"
      },
      {
        "word": "freigebig",
        "article": null,
        "pos": "adjective",
        "translation": "generous"
      }
    ],
    "prefixes": [
      {
        "word": "ergeben",
        "prefix": "er-",
        "article": null,
        "pos": "verb",
        "translation": "to result in, yield, surrender"
      },
      {
        "word": "vergeben",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to forgive, allocate, award"
      },
      {
        "word": "begeben",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to proceed, occur (sich)"
      },
      {
        "word": "umgeben",
        "prefix": "um-",
        "article": null,
        "pos": "verb",
        "translation": "to surround, enclose"
      }
    ],
    "separableVerbs": [
      {
        "word": "aufgeben",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to give up, mail (letter), assign"
      },
      {
        "word": "abgeben",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to hand in, submit, emit"
      },
      {
        "word": "angeben",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to state, specify, show off"
      },
      {
        "word": "ausgeben",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to spend (money), distribute"
      },
      {
        "word": "eingeben",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to enter, input (data)"
      },
      {
        "word": "nachgeben",
        "prefix": "nach-",
        "article": null,
        "pos": "verb",
        "translation": "to yield, give in"
      },
      {
        "word": "vorgeben",
        "prefix": "vor-",
        "article": null,
        "pos": "verb",
        "translation": "to pretend, specify in advance"
      },
      {
        "word": "weggeben",
        "prefix": "weg-",
        "article": null,
        "pos": "verb",
        "translation": "to give away"
      },
      {
        "word": "zugeben",
        "prefix": "zu-",
        "article": null,
        "pos": "verb",
        "translation": "to admit, confess, add"
      },
      {
        "word": "zurückgeben",
        "prefix": "zurück-",
        "article": null,
        "pos": "verb",
        "translation": "to give back, return"
      }
    ],
    "suffixes": [
      {
        "word": "das Ergebnis",
        "suffix": "-nis",
        "article": "das",
        "pos": "noun",
        "translation": "result"
      },
      {
        "word": "die Umgebung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "environment"
      }
    ]
  },
  "setz": {
    "root": "setz",
    "base": "setzen",
    "wordFamily": [
      {
        "word": "das Gesetz",
        "article": "das",
        "pos": "noun",
        "translation": "law, statute"
      },
      {
        "word": "der Einsatz",
        "article": "der",
        "pos": "noun",
        "translation": "deployment, commitment"
      },
      {
        "word": "der Absatz",
        "article": "der",
        "pos": "noun",
        "translation": "paragraph, sales"
      },
      {
        "word": "der Umsatz",
        "article": "der",
        "pos": "noun",
        "translation": "turnover, revenue"
      },
      {
        "word": "die Übersetzung",
        "article": "die",
        "pos": "noun",
        "translation": "translation"
      },
      {
        "word": "gesetzlich",
        "article": null,
        "pos": "adjective",
        "translation": "legal, statutory"
      }
    ],
    "prefixes": [
      {
        "word": "übersetzen",
        "prefix": "über-",
        "article": null,
        "pos": "verb",
        "translation": "to translate"
      },
      {
        "word": "besetzen",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to occupy"
      },
      {
        "word": "ersetzen",
        "prefix": "er-",
        "article": null,
        "pos": "verb",
        "translation": "to replace"
      }
    ],
    "separableVerbs": [
      {
        "word": "einsetzen",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to deploy, insert"
      },
      {
        "word": "umsetzen",
        "prefix": "um-",
        "article": null,
        "pos": "verb",
        "translation": "to implement, convert"
      },
      {
        "word": "aussetzen",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to suspend, expose"
      },
      {
        "word": "fortsetzen",
        "prefix": "fort-",
        "article": null,
        "pos": "verb",
        "translation": "to continue, resume"
      }
    ],
    "suffixes": [
      {
        "word": "die Übersetzung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "translation"
      },
      {
        "word": "ersetzbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "replaceable"
      }
    ]
  },
  "schreib": {
    "root": "schreib",
    "base": "schreiben",
    "wordFamily": [
      {
        "word": "die Schrift",
        "article": "die",
        "pos": "noun",
        "translation": "script, writing"
      },
      {
        "word": "die Unterschrift",
        "article": "die",
        "pos": "noun",
        "translation": "signature"
      },
      {
        "word": "die Beschreibung",
        "article": "die",
        "pos": "noun",
        "translation": "description"
      },
      {
        "word": "die Vorschrift",
        "article": "die",
        "pos": "noun",
        "translation": "regulation, rule"
      },
      {
        "word": "schriftlich",
        "article": null,
        "pos": "adjective",
        "translation": "written, in writing"
      }
    ],
    "prefixes": [
      {
        "word": "beschreiben",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to describe"
      },
      {
        "word": "unterschreiben",
        "prefix": "unter-",
        "article": null,
        "pos": "verb",
        "translation": "to sign"
      },
      {
        "word": "verschreiben",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to prescribe"
      }
    ],
    "separableVerbs": [
      {
        "word": "aufschreiben",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to write down"
      },
      {
        "word": "abschreiben",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to copy, write off"
      },
      {
        "word": "einschreiben",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to register, enroll"
      },
      {
        "word": "vorschreiben",
        "prefix": "vor-",
        "article": null,
        "pos": "verb",
        "translation": "to prescribe, mandate"
      }
    ],
    "suffixes": [
      {
        "word": "die Beschreibung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "description"
      },
      {
        "word": "schriftlich",
        "suffix": "-lich",
        "article": null,
        "pos": "adjective",
        "translation": "in writing"
      }
    ]
  },
  "les": {
    "root": "les",
    "base": "lesen",
    "wordFamily": [
      {
        "word": "das Lesen",
        "article": "das",
        "pos": "noun",
        "translation": "reading"
      },
      {
        "word": "die Lesung",
        "article": "die",
        "pos": "noun",
        "translation": "reading, lecture"
      },
      {
        "word": "die Vorlesung",
        "article": "die",
        "pos": "noun",
        "translation": "university lecture"
      },
      {
        "word": "der Leser",
        "article": "der",
        "pos": "noun",
        "translation": "reader"
      },
      {
        "word": "lesbar",
        "article": null,
        "pos": "adjective",
        "translation": "readable, legible"
      }
    ],
    "prefixes": [
      {
        "word": "verlesen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to read aloud / misread"
      }
    ],
    "separableVerbs": [
      {
        "word": "vorlesen",
        "prefix": "vor-",
        "article": null,
        "pos": "verb",
        "translation": "to read out loud to someone"
      },
      {
        "word": "ablesen",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to read off, meter reading"
      },
      {
        "word": "durchlesen",
        "prefix": "durch-",
        "article": null,
        "pos": "verb",
        "translation": "to read through carefully"
      }
    ],
    "suffixes": [
      {
        "word": "die Vorlesung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "lecture"
      },
      {
        "word": "lesbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "readable"
      }
    ]
  },
  "fass": {
    "root": "fass",
    "base": "fassen",
    "wordFamily": [
      {
        "word": "die Fassung",
        "article": "die",
        "pos": "noun",
        "translation": "version, frame, composure"
      },
      {
        "word": "die Auffassung",
        "article": "die",
        "pos": "noun",
        "translation": "conception, opinion"
      },
      {
        "word": "der Verfasser",
        "article": "der",
        "pos": "noun",
        "translation": "author, writer"
      },
      {
        "word": "umfassend",
        "article": null,
        "pos": "adjective",
        "translation": "comprehensive, extensive"
      }
    ],
    "prefixes": [
      {
        "word": "erfassen",
        "prefix": "er-",
        "article": null,
        "pos": "verb",
        "translation": "to grasp, record, capture"
      },
      {
        "word": "verfassen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to compose, author, write"
      },
      {
        "word": "umfassen",
        "prefix": "um-",
        "article": null,
        "pos": "verb",
        "translation": "to encompass, comprise"
      }
    ],
    "separableVerbs": [
      {
        "word": "anfassen",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to touch, handle"
      },
      {
        "word": "auffassen",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to comprehend, interpret"
      },
      {
        "word": "zusammenfassen",
        "prefix": "zusammen-",
        "article": null,
        "pos": "verb",
        "translation": "to summarize"
      }
    ],
    "suffixes": [
      {
        "word": "die Zusammenfassung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "summary"
      },
      {
        "word": "fassbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "tangible, comprehensible"
      }
    ]
  },
  "schliess": {
    "root": "schliess",
    "base": "schließen",
    "wordFamily": [
      {
        "word": "der Schluss",
        "article": "der",
        "pos": "noun",
        "translation": "end, conclusion"
      },
      {
        "word": "der Abschluss",
        "article": "der",
        "pos": "noun",
        "translation": "graduation, degree, deal"
      },
      {
        "word": "der Entschluss",
        "article": "der",
        "pos": "noun",
        "translation": "decision, resolution"
      },
      {
        "word": "der Beschluss",
        "article": "der",
        "pos": "noun",
        "translation": "formal decree, decision"
      },
      {
        "word": "schlüssig",
        "article": null,
        "pos": "adjective",
        "translation": "conclusive, coherent"
      }
    ],
    "prefixes": [
      {
        "word": "beschließen",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to decide, resolve"
      },
      {
        "word": "entschließen",
        "prefix": "ent-",
        "article": null,
        "pos": "verb",
        "translation": "to make up one's mind"
      },
      {
        "word": "verschließen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to lock up, close off"
      }
    ],
    "separableVerbs": [
      {
        "word": "abschließen",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to conclude, complete, lock"
      },
      {
        "word": "anschließen",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to connect, join"
      },
      {
        "word": "ausschließen",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to exclude, rule out"
      },
      {
        "word": "einschließen",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to include, lock in"
      }
    ],
    "suffixes": [
      {
        "word": "die Schließung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "closure"
      },
      {
        "word": "schlüssig",
        "suffix": "-ig",
        "article": null,
        "pos": "adjective",
        "translation": "coherent"
      }
    ]
  },
  "halt": {
    "root": "halt",
    "base": "halten",
    "wordFamily": [
      {
        "word": "die Haltung",
        "article": "die",
        "pos": "noun",
        "translation": "attitude, posture, stance"
      },
      {
        "word": "das Verhalten",
        "article": "das",
        "pos": "noun",
        "translation": "behavior, conduct"
      },
      {
        "word": "die Unterhaltung",
        "article": "die",
        "pos": "noun",
        "translation": "entertainment, conversation"
      },
      {
        "word": "nachhaltig",
        "article": null,
        "pos": "adjective",
        "translation": "sustainable, enduring"
      },
      {
        "word": "die Nachhaltigkeit",
        "article": "die",
        "pos": "noun",
        "translation": "sustainability"
      }
    ],
    "prefixes": [
      {
        "word": "behalten",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to keep, retain, remember"
      },
      {
        "word": "erhalten",
        "prefix": "er-",
        "article": null,
        "pos": "verb",
        "translation": "to receive, maintain, obtain"
      },
      {
        "word": "unterhalten",
        "prefix": "unter-",
        "article": null,
        "pos": "verb",
        "translation": "to entertain, converse, support"
      },
      {
        "word": "verhalten",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to behave, act"
      }
    ],
    "separableVerbs": [
      {
        "word": "anhalten",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to stop, pause, endure"
      },
      {
        "word": "aufhalten",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to detain, delay, stay"
      },
      {
        "word": "aushalten",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to endure, withstand"
      },
      {
        "word": "einhalten",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to adhere to, observe (rules)"
      },
      {
        "word": "festhalten",
        "prefix": "fest-",
        "article": null,
        "pos": "verb",
        "translation": "to hold tight, record, cling"
      },
      {
        "word": "vorhalten",
        "prefix": "vor-",
        "article": null,
        "pos": "verb",
        "translation": "to reproach, maintain stock"
      }
    ],
    "suffixes": [
      {
        "word": "die Haltung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "attitude"
      },
      {
        "word": "die Nachhaltigkeit",
        "suffix": "-keit",
        "article": "die",
        "pos": "noun",
        "translation": "sustainability"
      },
      {
        "word": "haltbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "durable, non-perishable"
      }
    ]
  },
  "stell": {
    "root": "stell",
    "base": "stellen",
    "wordFamily": [
      {
        "word": "die Stellung",
        "article": "die",
        "pos": "noun",
        "translation": "position, job, stance"
      },
      {
        "word": "die Einstellung",
        "article": "die",
        "pos": "noun",
        "translation": "attitude, setting, recruitment"
      },
      {
        "word": "die Vorstellung",
        "article": "die",
        "pos": "noun",
        "translation": "idea, presentation, introduction"
      },
      {
        "word": "die Ausstellung",
        "article": "die",
        "pos": "noun",
        "translation": "exhibition, show"
      },
      {
        "word": "die Bestellung",
        "article": "die",
        "pos": "noun",
        "translation": "order, reservation"
      }
    ],
    "prefixes": [
      {
        "word": "bestellen",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to order, reserve"
      },
      {
        "word": "erstellen",
        "prefix": "er-",
        "article": null,
        "pos": "verb",
        "translation": "to create, generate, produce"
      },
      {
        "word": "verstellen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to adjust, disguise, block"
      }
    ],
    "separableVerbs": [
      {
        "word": "vorstellen",
        "prefix": "vor-",
        "article": null,
        "pos": "verb",
        "translation": "to introduce, imagine, present"
      },
      {
        "word": "einstellen",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to adjust, hire, cease"
      },
      {
        "word": "aufstellen",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to set up, erect, deploy"
      },
      {
        "word": "feststellen",
        "prefix": "fest-",
        "article": null,
        "pos": "verb",
        "translation": "to ascertain, notice, state"
      },
      {
        "word": "abstellen",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to park, switch off, remedy"
      }
    ],
    "suffixes": [
      {
        "word": "die Vorstellung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "idea, introduction"
      },
      {
        "word": "stellbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "adjustable"
      }
    ]
  },
  "such": {
    "root": "such",
    "base": "suchen",
    "wordFamily": [
      {
        "word": "die Suche",
        "article": "die",
        "pos": "noun",
        "translation": "search, quest"
      },
      {
        "word": "die Untersuchung",
        "article": "die",
        "pos": "noun",
        "translation": "investigation, medical checkup"
      },
      {
        "word": "der Versuch",
        "article": "der",
        "pos": "noun",
        "translation": "attempt, experiment, trial"
      }
    ],
    "prefixes": [
      {
        "word": "untersuchen",
        "prefix": "unter-",
        "article": null,
        "pos": "verb",
        "translation": "to investigate, examine"
      },
      {
        "word": "versuchen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to try, attempt, test"
      },
      {
        "word": "ersuchen",
        "prefix": "er-",
        "article": null,
        "pos": "verb",
        "translation": "to request formally"
      }
    ],
    "separableVerbs": [
      {
        "word": "aussuchen",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to pick out, choose, select"
      },
      {
        "word": "absuchen",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to scan, search thoroughly"
      },
      {
        "word": "heimsuchen",
        "prefix": "heim-",
        "article": null,
        "pos": "verb",
        "translation": "to afflict, haunt"
      }
    ],
    "suffixes": [
      {
        "word": "die Untersuchung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "investigation"
      }
    ]
  },
  "find": {
    "root": "find",
    "base": "finden",
    "wordFamily": [
      {
        "word": "der Fund",
        "article": "der",
        "pos": "noun",
        "translation": "find, discovery"
      },
      {
        "word": "die Erfindung",
        "article": "die",
        "pos": "noun",
        "translation": "invention"
      },
      {
        "word": "der Erfinder",
        "article": "der",
        "pos": "noun",
        "translation": "inventor"
      },
      {
        "word": "das Befinden",
        "article": "das",
        "pos": "noun",
        "translation": "state of health, wellbeing"
      },
      {
        "word": "findig",
        "article": null,
        "pos": "adjective",
        "translation": "resourceful, ingenious"
      }
    ],
    "prefixes": [
      {
        "word": "erfinden",
        "prefix": "er-",
        "article": null,
        "pos": "verb",
        "translation": "to invent, devise"
      },
      {
        "word": "befinden",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to be located / feel (health)"
      },
      {
        "word": "empfinden",
        "prefix": "emp-",
        "article": null,
        "pos": "verb",
        "translation": "to feel, perceive, sense"
      }
    ],
    "separableVerbs": [
      {
        "word": "herausfinden",
        "prefix": "heraus-",
        "article": null,
        "pos": "verb",
        "translation": "to find out, discover"
      },
      {
        "word": "stattfinden",
        "prefix": "statt-",
        "article": null,
        "pos": "verb",
        "translation": "to take place, happen"
      },
      {
        "word": "vorfinden",
        "prefix": "vor-",
        "article": null,
        "pos": "verb",
        "translation": "to encounter, find in place"
      },
      {
        "word": "abfinden",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to come to terms with, compensate"
      }
    ],
    "suffixes": [
      {
        "word": "die Erfindung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "invention"
      },
      {
        "word": "findbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "findable"
      }
    ]
  },
  "komm": {
    "root": "komm",
    "base": "kommen",
    "wordFamily": [
      {
        "word": "die Ankunft",
        "article": "die",
        "pos": "noun",
        "translation": "arrival"
      },
      {
        "word": "das Einkommen",
        "article": "das",
        "pos": "noun",
        "translation": "income, earnings"
      },
      {
        "word": "die Herkunft",
        "article": "die",
        "pos": "noun",
        "translation": "origin, descent"
      },
      {
        "word": "das Vorkommnis",
        "article": "das",
        "pos": "noun",
        "translation": "incident, occurrence"
      },
      {
        "word": "willkommen",
        "article": null,
        "pos": "adjective",
        "translation": "welcome"
      },
      {
        "word": "abkömmlich",
        "article": null,
        "pos": "adjective",
        "translation": "available, dispensable"
      }
    ],
    "prefixes": [
      {
        "word": "bekommen",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to receive, get"
      },
      {
        "word": "entkommen",
        "prefix": "ent-",
        "article": null,
        "pos": "verb",
        "translation": "to escape, flee"
      },
      {
        "word": "verkommen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to decay, degenerate"
      }
    ],
    "separableVerbs": [
      {
        "word": "ankommen",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to arrive, depend on"
      },
      {
        "word": "mitkommen",
        "prefix": "mit-",
        "article": null,
        "pos": "verb",
        "translation": "to come along, keep up"
      },
      {
        "word": "vorkommen",
        "prefix": "vor-",
        "article": null,
        "pos": "verb",
        "translation": "to happen, seem, occur"
      },
      {
        "word": "auskommen",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to get along, manage"
      },
      {
        "word": "weiterkommen",
        "prefix": "weiter-",
        "article": null,
        "pos": "verb",
        "translation": "to make progress, get ahead"
      },
      {
        "word": "zurückkommen",
        "prefix": "zurück-",
        "article": null,
        "pos": "verb",
        "translation": "to come back, return"
      },
      {
        "word": "zusammenkommen",
        "prefix": "zusammen-",
        "article": null,
        "pos": "verb",
        "translation": "to gather, meet"
      },
      {
        "word": "zukommen",
        "prefix": "zu-",
        "article": null,
        "pos": "verb",
        "translation": "to approach, be entitled to"
      },
      {
        "word": "abkommen",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to deviate, stray"
      },
      {
        "word": "herkommen",
        "prefix": "her-",
        "article": null,
        "pos": "verb",
        "translation": "to come from, originate"
      }
    ],
    "suffixes": [
      {
        "word": "abkömmlich",
        "suffix": "-lich",
        "article": null,
        "pos": "adjective",
        "translation": "dispensable"
      },
      {
        "word": "das Vorkommnis",
        "suffix": "-nis",
        "article": "das",
        "pos": "noun",
        "translation": "occurrence"
      }
    ]
  },
  "steh": {
    "root": "steh",
    "base": "stehen",
    "wordFamily": [
      {
        "word": "der Stand",
        "article": "der",
        "pos": "noun",
        "translation": "status, stand, state"
      },
      {
        "word": "der Standort",
        "article": "der",
        "pos": "noun",
        "translation": "location, site"
      },
      {
        "word": "der Abstand",
        "article": "der",
        "pos": "noun",
        "translation": "distance, clearance"
      },
      {
        "word": "der Verstand",
        "article": "der",
        "pos": "noun",
        "translation": "reason, intellect, mind"
      },
      {
        "word": "der Gegenstand",
        "article": "der",
        "pos": "noun",
        "translation": "object, topic, item"
      },
      {
        "word": "der Zustand",
        "article": "der",
        "pos": "noun",
        "translation": "condition, state"
      },
      {
        "word": "ständig",
        "article": null,
        "pos": "adjective",
        "translation": "constant, permanent"
      },
      {
        "word": "selbstständig",
        "article": null,
        "pos": "adjective",
        "translation": "independent, self-employed"
      }
    ],
    "prefixes": [
      {
        "word": "verstehen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to understand, comprehend"
      },
      {
        "word": "bestehen",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to pass (exam), insist, exist"
      },
      {
        "word": "entstehen",
        "prefix": "ent-",
        "article": null,
        "pos": "verb",
        "translation": "to arise, originate, emerge"
      },
      {
        "word": "gestehen",
        "prefix": "ge-",
        "article": null,
        "pos": "verb",
        "translation": "to confess, admit"
      }
    ],
    "separableVerbs": [
      {
        "word": "aufstehen",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to get up, stand up"
      },
      {
        "word": "ausstehen",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to endure, tolerate, be pending"
      },
      {
        "word": "anstehen",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to queue, be due"
      },
      {
        "word": "beistehen",
        "prefix": "bei-",
        "article": null,
        "pos": "verb",
        "translation": "to stand by, assist"
      },
      {
        "word": "einstehen",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to answer for, vouch for"
      },
      {
        "word": "feststehen",
        "prefix": "fest-",
        "article": null,
        "pos": "verb",
        "translation": "to be certain, be determined"
      },
      {
        "word": "vorstehen",
        "prefix": "vor-",
        "article": null,
        "pos": "verb",
        "translation": "to preside over, project"
      },
      {
        "word": "zustehen",
        "prefix": "zu-",
        "article": null,
        "pos": "verb",
        "translation": "to be due to, belong to"
      },
      {
        "word": "zurückstehen",
        "prefix": "zurück-",
        "article": null,
        "pos": "verb",
        "translation": "to take back seat, step back"
      }
    ],
    "suffixes": [
      {
        "word": "ständig",
        "suffix": "-ig",
        "article": null,
        "pos": "adjective",
        "translation": "constant"
      },
      {
        "word": "die Selbstständigkeit",
        "suffix": "-keit",
        "article": "die",
        "pos": "noun",
        "translation": "independence"
      }
    ]
  },
  "geh": {
    "root": "geh",
    "base": "gehen",
    "wordFamily": [
      {
        "word": "der Gang",
        "article": "der",
        "pos": "noun",
        "translation": "corridor, walk, gear"
      },
      {
        "word": "der Vorgang",
        "article": "der",
        "pos": "noun",
        "translation": "process, transaction"
      },
      {
        "word": "der Ausgang",
        "article": "der",
        "pos": "noun",
        "translation": "exit, outcome"
      },
      {
        "word": "der Eingang",
        "article": "der",
        "pos": "noun",
        "translation": "entrance, inbox"
      },
      {
        "word": "der Übergang",
        "article": "der",
        "pos": "noun",
        "translation": "transition, crossing"
      },
      {
        "word": "gängig",
        "article": null,
        "pos": "adjective",
        "translation": "common, standard"
      },
      {
        "word": "umgehend",
        "article": null,
        "pos": "adjective",
        "translation": "prompt, immediate"
      }
    ],
    "prefixes": [
      {
        "word": "begehen",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to commit (crime), inspect, celebrate"
      },
      {
        "word": "entgehen",
        "prefix": "ent-",
        "article": null,
        "pos": "verb",
        "translation": "to escape, miss out on"
      },
      {
        "word": "vergehen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to pass (time), perish"
      },
      {
        "word": "ergehen",
        "prefix": "er-",
        "article": null,
        "pos": "verb",
        "translation": "to fare, be issued"
      }
    ],
    "separableVerbs": [
      {
        "word": "ausgehen",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to go out, assume, run out"
      },
      {
        "word": "angehen",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to concern, tackle, turn on"
      },
      {
        "word": "aufgehen",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to rise, open, make sense"
      },
      {
        "word": "eingehen",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to enter into, shrink, respond to"
      },
      {
        "word": "mitgehen",
        "prefix": "mit-",
        "article": null,
        "pos": "verb",
        "translation": "to go along with"
      },
      {
        "word": "vorgehen",
        "prefix": "vor-",
        "article": null,
        "pos": "verb",
        "translation": "to proceed, take priority"
      },
      {
        "word": "weggehen",
        "prefix": "weg-",
        "article": null,
        "pos": "verb",
        "translation": "to walk away, leave"
      },
      {
        "word": "weitergehen",
        "prefix": "weiter-",
        "article": null,
        "pos": "verb",
        "translation": "to keep going, continue"
      },
      {
        "word": "zugehen",
        "prefix": "zu-",
        "article": null,
        "pos": "verb",
        "translation": "to close, approach, happen"
      },
      {
        "word": "zurückgehen",
        "prefix": "zurück-",
        "article": null,
        "pos": "verb",
        "translation": "to decrease, go back"
      }
    ],
    "suffixes": [
      {
        "word": "gängig",
        "suffix": "-ig",
        "article": null,
        "pos": "adjective",
        "translation": "standard, current"
      },
      {
        "word": "die Gängigkeit",
        "suffix": "-keit",
        "article": "die",
        "pos": "noun",
        "translation": "currency, popularity"
      }
    ]
  },
  "nehm": {
    "root": "nehm",
    "base": "nehmen",
    "wordFamily": [
      {
        "word": "die Ausnahme",
        "article": "die",
        "pos": "noun",
        "translation": "exception"
      },
      {
        "word": "die Aufnahme",
        "article": "die",
        "pos": "noun",
        "translation": "recording, admission, intake"
      },
      {
        "word": "die Einnahme",
        "article": "die",
        "pos": "noun",
        "translation": "revenue, intake"
      },
      {
        "word": "die Maßnahme",
        "article": "die",
        "pos": "noun",
        "translation": "measure, action"
      },
      {
        "word": "das Unternehmen",
        "article": "das",
        "pos": "noun",
        "translation": "company, enterprise"
      },
      {
        "word": "der Teilnehmer",
        "article": "der",
        "pos": "noun",
        "translation": "participant"
      },
      {
        "word": "angenehm",
        "article": null,
        "pos": "adjective",
        "translation": "pleasant, agreeable"
      },
      {
        "word": "vornehm",
        "article": null,
        "pos": "adjective",
        "translation": "distinguished, noble"
      }
    ],
    "prefixes": [
      {
        "word": "benehmen",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to behave, conduct oneself"
      },
      {
        "word": "entnehmen",
        "prefix": "ent-",
        "article": null,
        "pos": "verb",
        "translation": "to extract, infer, deduce"
      },
      {
        "word": "vernehmen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to interrogate, hear"
      },
      {
        "word": "übernehmen",
        "prefix": "über-",
        "article": null,
        "pos": "verb",
        "translation": "to take over, assume (responsibility)"
      }
    ],
    "separableVerbs": [
      {
        "word": "abnehmen",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to decrease, lose weight, answer (call)"
      },
      {
        "word": "annehmen",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to accept, assume"
      },
      {
        "word": "aufnehmen",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to record, absorb, host"
      },
      {
        "word": "ausnehmen",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to except, gut, fleece"
      },
      {
        "word": "einnehmen",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to take (medicine), capture, earn"
      },
      {
        "word": "mitnehmen",
        "prefix": "mit-",
        "article": null,
        "pos": "verb",
        "translation": "to take along, pick up"
      },
      {
        "word": "vornehmen",
        "prefix": "vor-",
        "article": null,
        "pos": "verb",
        "translation": "to undertake, intend to do"
      },
      {
        "word": "wegnehmen",
        "prefix": "weg-",
        "article": null,
        "pos": "verb",
        "translation": "to take away, confiscate"
      },
      {
        "word": "zunehmen",
        "prefix": "zu-",
        "article": null,
        "pos": "verb",
        "translation": "to increase, gain weight"
      },
      {
        "word": "zurücknehmen",
        "prefix": "zurück-",
        "article": null,
        "pos": "verb",
        "translation": "to retract, take back"
      }
    ],
    "suffixes": [
      {
        "word": "nehmbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "acceptable"
      },
      {
        "word": "die Teilnahme",
        "suffix": "-e",
        "article": "die",
        "pos": "noun",
        "translation": "participation"
      }
    ]
  },
  "lös": {
    "root": "lös",
    "base": "lösen",
    "wordFamily": [
      {
        "word": "die Lösung",
        "article": "die",
        "pos": "noun",
        "translation": "solution, solving"
      },
      {
        "word": "das Lösungsmittel",
        "article": "das",
        "pos": "noun",
        "translation": "solvent"
      },
      {
        "word": "lösbar",
        "article": null,
        "pos": "adjective",
        "translation": "solvable"
      },
      {
        "word": "lösungsorientiert",
        "article": null,
        "pos": "adjective",
        "translation": "solution-oriented"
      },
      {
        "word": "erlöst",
        "article": null,
        "pos": "adjective",
        "translation": "redeemed, saved"
      }
    ],
    "prefixes": [
      {
        "word": "erlösen",
        "prefix": "er-",
        "article": null,
        "pos": "verb",
        "translation": "to redeem, liberate, rescue"
      },
      {
        "word": "verlösen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to raffle off"
      }
    ],
    "separableVerbs": [
      {
        "word": "auflösen",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to dissolve, disperse, resolve"
      },
      {
        "word": "auslösen",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to trigger, cause, spark"
      },
      {
        "word": "ablösen",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to replace, peel off, relieve"
      },
      {
        "word": "einlösen",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to redeem (voucher), fulfill (promise)"
      },
      {
        "word": "herauslösen",
        "prefix": "heraus-",
        "article": null,
        "pos": "verb",
        "translation": "to extract, detach from"
      },
      {
        "word": "loslösen",
        "prefix": "los-",
        "article": null,
        "pos": "verb",
        "translation": "to detach, uncouple"
      }
    ],
    "suffixes": [
      {
        "word": "die Lösung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "solution"
      },
      {
        "word": "lösbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "solvable"
      },
      {
        "word": "die Lösbarkeit",
        "suffix": "-keit",
        "article": "die",
        "pos": "noun",
        "translation": "solvability"
      }
    ]
  },
  "schlag": {
    "root": "schlag",
    "base": "schlagen",
    "wordFamily": [
      {
        "word": "der Schlag",
        "article": "der",
        "pos": "noun",
        "translation": "hit, beat, blow"
      },
      {
        "word": "der Vorschlag",
        "article": "der",
        "pos": "noun",
        "translation": "proposal, suggestion"
      },
      {
        "word": "der Anschlag",
        "article": "der",
        "pos": "noun",
        "translation": "attack, strike, notice"
      },
      {
        "word": "der Ratschlag",
        "article": "der",
        "pos": "noun",
        "translation": "advice, tip"
      },
      {
        "word": "schlagfertig",
        "article": null,
        "pos": "adjective",
        "translation": "quick-witted"
      }
    ],
    "prefixes": [
      {
        "word": "beschlagen",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to fog up, mount"
      },
      {
        "word": "erschlagen",
        "prefix": "er-",
        "article": null,
        "pos": "verb",
        "translation": "to slay, overwhelm"
      },
      {
        "word": "verschlagen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to misplace, drift"
      },
      {
        "word": "zerschlagen",
        "prefix": "zer-",
        "article": null,
        "pos": "verb",
        "translation": "to smash to pieces"
      }
    ],
    "separableVerbs": [
      {
        "word": "vorschlagen",
        "prefix": "vor-",
        "article": null,
        "pos": "verb",
        "translation": "to suggest, propose"
      },
      {
        "word": "abschlagen",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to refuse, knock off"
      },
      {
        "word": "anschlagen",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to strike, take effect, post"
      },
      {
        "word": "aufschlagen",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to open (book), crack (egg), pitch (tent)"
      },
      {
        "word": "ausschlagen",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to decline, kick out, deflect"
      },
      {
        "word": "einschlagen",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to smash in, hit upon, take a path"
      },
      {
        "word": "nachschlagen",
        "prefix": "nach-",
        "article": null,
        "pos": "verb",
        "translation": "to look up, consult (reference)"
      },
      {
        "word": "zuschlagen",
        "prefix": "zu-",
        "article": null,
        "pos": "verb",
        "translation": "to slam shut, strike a bargain"
      }
    ],
    "suffixes": [
      {
        "word": "schlagbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "beatable"
      },
      {
        "word": "der Vorschlag",
        "suffix": "-lag",
        "article": "der",
        "pos": "noun",
        "translation": "proposal"
      }
    ]
  },
  "führ": {
    "root": "führ",
    "base": "führen",
    "wordFamily": [
      {
        "word": "die Führung",
        "article": "die",
        "pos": "noun",
        "translation": "leadership, tour, guidance"
      },
      {
        "word": "der Führer",
        "article": "der",
        "pos": "noun",
        "translation": "guide, leader"
      },
      {
        "word": "der Führerschein",
        "article": "der",
        "pos": "noun",
        "translation": "driver's license"
      },
      {
        "word": "die Einführung",
        "article": "die",
        "pos": "noun",
        "translation": "introduction, rollout"
      },
      {
        "word": "führend",
        "article": null,
        "pos": "adjective",
        "translation": "leading, prominent"
      }
    ],
    "prefixes": [
      {
        "word": "verführen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to seduce, tempt"
      },
      {
        "word": "entführen",
        "prefix": "ent-",
        "article": null,
        "pos": "verb",
        "translation": "to kidnap, hijack"
      },
      {
        "word": "überführen",
        "prefix": "über-",
        "article": null,
        "pos": "verb",
        "translation": "to convict, transfer"
      }
    ],
    "separableVerbs": [
      {
        "word": "einführen",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to introduce, import, implement"
      },
      {
        "word": "ausführen",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to execute, carry out, export"
      },
      {
        "word": "anführen",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to lead, cite, quote"
      },
      {
        "word": "aufführen",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to perform (play), list, behave"
      },
      {
        "word": "abführen",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to pay (taxes), divert, lead away"
      },
      {
        "word": "vorführen",
        "prefix": "vor-",
        "article": null,
        "pos": "verb",
        "translation": "to demonstrate, present, screen"
      },
      {
        "word": "weiterführen",
        "prefix": "weiter-",
        "article": null,
        "pos": "verb",
        "translation": "to continue, carry forward"
      },
      {
        "word": "zuführen",
        "prefix": "zu-",
        "article": null,
        "pos": "verb",
        "translation": "to supply, feed into, channel"
      },
      {
        "word": "zurückführen",
        "prefix": "zurück-",
        "article": null,
        "pos": "verb",
        "translation": "to attribute to, trace back"
      }
    ],
    "suffixes": [
      {
        "word": "die Führung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "guidance"
      },
      {
        "word": "führbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "manageable"
      }
    ]
  },
  "bring": {
    "root": "bring",
    "base": "bringen",
    "wordFamily": [
      {
        "word": "das Bringen",
        "article": "das",
        "pos": "noun",
        "translation": "bringing, delivery"
      },
      {
        "word": "der Mitbringsel",
        "article": "das",
        "pos": "noun",
        "translation": "small souvenir, gift"
      },
      {
        "word": "die Einbringung",
        "article": "die",
        "pos": "noun",
        "translation": "introduction, tabling"
      }
    ],
    "prefixes": [
      {
        "word": "verbringen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to spend (time), pass"
      },
      {
        "word": "erbringen",
        "prefix": "er-",
        "article": null,
        "pos": "verb",
        "translation": "to provide, furnish (proof)"
      },
      {
        "word": "vollbringen",
        "prefix": "voll-",
        "article": null,
        "pos": "verb",
        "translation": "to accomplish, achieve"
      }
    ],
    "separableVerbs": [
      {
        "word": "mitbringen",
        "prefix": "mit-",
        "article": null,
        "pos": "verb",
        "translation": "to bring along"
      },
      {
        "word": "beibringen",
        "prefix": "bei-",
        "article": null,
        "pos": "verb",
        "translation": "to teach, break news to"
      },
      {
        "word": "anbringen",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to attach, install, voice"
      },
      {
        "word": "aufbringen",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to muster (courage), raise (funds)"
      },
      {
        "word": "ausbringen",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to deploy, toast, spread"
      },
      {
        "word": "einbringen",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to contribute, yield, introduce"
      },
      {
        "word": "vorbringen",
        "prefix": "vor-",
        "article": null,
        "pos": "verb",
        "translation": "to present, utter, argue"
      },
      {
        "word": "wegbringen",
        "prefix": "weg-",
        "article": null,
        "pos": "verb",
        "translation": "to take away, dispose of"
      },
      {
        "word": "zubringen",
        "prefix": "zu-",
        "article": null,
        "pos": "verb",
        "translation": "to spend (time), bring to"
      },
      {
        "word": "zurückbringen",
        "prefix": "zurück-",
        "article": null,
        "pos": "verb",
        "translation": "to return, bring back"
      }
    ],
    "suffixes": [
      {
        "word": "die Erbringung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "performance, delivery"
      }
    ]
  },
  "pass": {
    "root": "pass",
    "base": "passen",
    "wordFamily": [
      {
        "word": "die Passung",
        "article": "die",
        "pos": "noun",
        "translation": "fit, clearance"
      },
      {
        "word": "die Anpassung",
        "article": "die",
        "pos": "noun",
        "translation": "adaptation, adjustment"
      },
      {
        "word": "passend",
        "article": null,
        "pos": "adjective",
        "translation": "suitable, fitting"
      },
      {
        "word": "anpassungsfähig",
        "article": null,
        "pos": "adjective",
        "translation": "adaptable, flexible"
      },
      {
        "word": "unpassend",
        "article": null,
        "pos": "adjective",
        "translation": "inappropriate"
      }
    ],
    "prefixes": [
      {
        "word": "verpassen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to miss (bus, train, chance)"
      }
    ],
    "separableVerbs": [
      {
        "word": "anpassen",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to adapt, adjust, customize"
      },
      {
        "word": "aufpassen",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to pay attention, watch out"
      },
      {
        "word": "abpassen",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to wait for, intercept"
      },
      {
        "word": "zusammenpassen",
        "prefix": "zusammen-",
        "article": null,
        "pos": "verb",
        "translation": "to match, fit together"
      },
      {
        "word": "reinpassen",
        "prefix": "rein-",
        "article": null,
        "pos": "verb",
        "translation": "to fit inside"
      }
    ],
    "suffixes": [
      {
        "word": "die Anpassung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "adaptation"
      },
      {
        "word": "anpassbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "adaptable"
      },
      {
        "word": "die Anpassbarkeit",
        "suffix": "-keit",
        "article": "die",
        "pos": "noun",
        "translation": "adaptability"
      }
    ]
  },
  "arbeit": {
    "root": "arbeit",
    "base": "arbeiten",
    "wordFamily": [
      {
        "word": "die Arbeit",
        "article": "die",
        "pos": "noun",
        "translation": "work, job, paper"
      },
      {
        "word": "der Arbeiter",
        "article": "der",
        "pos": "noun",
        "translation": "worker"
      },
      {
        "word": "der Arbeitsplatz",
        "article": "der",
        "pos": "noun",
        "translation": "workplace, job"
      },
      {
        "word": "arbeitslos",
        "article": null,
        "pos": "adjective",
        "translation": "unemployed"
      },
      {
        "word": "arbeitsfähig",
        "article": null,
        "pos": "adjective",
        "translation": "able to work"
      }
    ],
    "prefixes": [
      {
        "word": "bearbeiten",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to edit, process, work on"
      },
      {
        "word": "verarbeiten",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to process, digest, assimilate"
      },
      {
        "word": "erarbeiten",
        "prefix": "er-",
        "article": null,
        "pos": "verb",
        "translation": "to develop, compile, earn"
      }
    ],
    "separableVerbs": [
      {
        "word": "ausarbeiten",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to elaborate, work out, draft"
      },
      {
        "word": "zusammenarbeiten",
        "prefix": "zusammen-",
        "article": null,
        "pos": "verb",
        "translation": "to collaborate, cooperate"
      },
      {
        "word": "abarbeiten",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to work off, process backlog"
      },
      {
        "word": "einarbeiten",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to train, integrate, incorporate"
      },
      {
        "word": "mitarbeiten",
        "prefix": "mit-",
        "article": null,
        "pos": "verb",
        "translation": "to collaborate, assist"
      },
      {
        "word": "vorarbeiten",
        "prefix": "vor-",
        "article": null,
        "pos": "verb",
        "translation": "to work ahead, prepare"
      }
    ],
    "suffixes": [
      {
        "word": "arbeitslos",
        "suffix": "-los",
        "article": null,
        "pos": "adjective",
        "translation": "unemployed"
      },
      {
        "word": "die Arbeitslosigkeit",
        "suffix": "-keit",
        "article": "die",
        "pos": "noun",
        "translation": "unemployment"
      }
    ]
  },
  "bau": {
    "root": "bau",
    "base": "bauen",
    "wordFamily": [
      {
        "word": "der Bau",
        "article": "der",
        "pos": "noun",
        "translation": "construction, building"
      },
      {
        "word": "das Gebäude",
        "article": "das",
        "pos": "noun",
        "translation": "building, edifice"
      },
      {
        "word": "die Baustelle",
        "article": "die",
        "pos": "noun",
        "translation": "construction site"
      },
      {
        "word": "der Aufbau",
        "article": "der",
        "pos": "noun",
        "translation": "structure, setup, development"
      },
      {
        "word": "baulich",
        "article": null,
        "pos": "adjective",
        "translation": "structural, constructional"
      }
    ],
    "prefixes": [
      {
        "word": "bebauen",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to build on, cultivate"
      },
      {
        "word": "verbauen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to obstruct, install wrong"
      }
    ],
    "separableVerbs": [
      {
        "word": "aufbauen",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to build up, erect, establish"
      },
      {
        "word": "ausbauen",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to expand, upgrade, dismantle"
      },
      {
        "word": "anbauen",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to cultivate, add on (room)"
      },
      {
        "word": "einbauen",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to install, fit in, integrate"
      },
      {
        "word": "umbauen",
        "prefix": "um-",
        "article": null,
        "pos": "verb",
        "translation": "to renovate, convert, rebuild"
      },
      {
        "word": "abbauen",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to dismantle, reduce, mine"
      },
      {
        "word": "zusammenbauen",
        "prefix": "zusammen-",
        "article": null,
        "pos": "verb",
        "translation": "to assemble, put together"
      }
    ],
    "suffixes": [
      {
        "word": "baulich",
        "suffix": "-lich",
        "article": null,
        "pos": "adjective",
        "translation": "structural"
      },
      {
        "word": "baubar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "buildable"
      }
    ]
  },
  "mach": {
    "root": "mach",
    "base": "machen",
    "wordFamily": [
      {
        "word": "die Machart",
        "article": "die",
        "pos": "noun",
        "translation": "style, make, technique"
      },
      {
        "word": "das Machen",
        "article": "das",
        "pos": "noun",
        "translation": "making, doing"
      },
      {
        "word": "machbar",
        "article": null,
        "pos": "adjective",
        "translation": "feasible, doable"
      },
      {
        "word": "die Machbarkeit",
        "article": "die",
        "pos": "noun",
        "translation": "feasibility"
      }
    ],
    "prefixes": [
      {
        "word": "vermachen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to bequeath, leave to"
      }
    ],
    "separableVerbs": [
      {
        "word": "aufmachen",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to open, untie"
      },
      {
        "word": "zumachen",
        "prefix": "zu-",
        "article": null,
        "pos": "verb",
        "translation": "to close, shut"
      },
      {
        "word": "anmachen",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to turn on, switch on"
      },
      {
        "word": "ausmachen",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to turn off, constitute, matter"
      },
      {
        "word": "abmachen",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to agree on, take off"
      },
      {
        "word": "mitmachen",
        "prefix": "mit-",
        "article": null,
        "pos": "verb",
        "translation": "to participate, join in"
      },
      {
        "word": "nachmachen",
        "prefix": "nach-",
        "article": null,
        "pos": "verb",
        "translation": "to imitate, forge, copy"
      },
      {
        "word": "vormachen",
        "prefix": "vor-",
        "article": null,
        "pos": "verb",
        "translation": "to demonstrate, fool someone"
      },
      {
        "word": "wegmachen",
        "prefix": "weg-",
        "article": null,
        "pos": "verb",
        "translation": "to remove, clean away"
      }
    ],
    "suffixes": [
      {
        "word": "machbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "feasible"
      },
      {
        "word": "die Machbarkeit",
        "suffix": "-keit",
        "article": "die",
        "pos": "noun",
        "translation": "feasibility"
      }
    ]
  },
  "fahr": {
    "root": "fahr",
    "base": "fahren",
    "wordFamily": [
      {
        "word": "die Fahrt",
        "article": "die",
        "pos": "noun",
        "translation": "drive, trip, journey"
      },
      {
        "word": "der Fahrer",
        "article": "der",
        "pos": "noun",
        "translation": "driver"
      },
      {
        "word": "das Fahrzeug",
        "article": "das",
        "pos": "noun",
        "translation": "vehicle"
      },
      {
        "word": "die Abfahrt",
        "article": "die",
        "pos": "noun",
        "translation": "departure, downhill run"
      },
      {
        "word": "die Erfahrung",
        "article": "die",
        "pos": "noun",
        "translation": "experience"
      },
      {
        "word": "erfahren",
        "article": null,
        "pos": "adjective",
        "translation": "experienced, skilled"
      }
    ],
    "prefixes": [
      {
        "word": "erfahren",
        "prefix": "er-",
        "article": null,
        "pos": "verb",
        "translation": "to experience, learn, find out"
      },
      {
        "word": "verfahren",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to proceed, get lost (sich)"
      },
      {
        "word": "befahren",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to navigate, travel on"
      }
    ],
    "separableVerbs": [
      {
        "word": "abfahren",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to depart, set off"
      },
      {
        "word": "anfahren",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to start moving, hit with vehicle"
      },
      {
        "word": "auffahren",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to rear-end, serve (food)"
      },
      {
        "word": "ausfahren",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to deliver, extend"
      },
      {
        "word": "einfahren",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to drive in, break in (car)"
      },
      {
        "word": "mitfahren",
        "prefix": "mit-",
        "article": null,
        "pos": "verb",
        "translation": "to ride along, carpool"
      },
      {
        "word": "vorfahren",
        "prefix": "vor-",
        "article": null,
        "pos": "verb",
        "translation": "to pull up in front, drive ahead"
      },
      {
        "word": "wegfahren",
        "prefix": "weg-",
        "article": null,
        "pos": "verb",
        "translation": "to drive away, leave"
      },
      {
        "word": "weiterfahren",
        "prefix": "weiter-",
        "article": null,
        "pos": "verb",
        "translation": "to continue driving"
      },
      {
        "word": "zurückfahren",
        "prefix": "zurück-",
        "article": null,
        "pos": "verb",
        "translation": "to drive back, scale back"
      }
    ],
    "suffixes": [
      {
        "word": "die Erfahrung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "experience"
      },
      {
        "word": "fahrbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "driveable, mobile"
      }
    ]
  },
  "hör": {
    "root": "hör",
    "base": "hören",
    "wordFamily": [
      {
        "word": "das Gehör",
        "article": "das",
        "pos": "noun",
        "translation": "hearing, ear"
      },
      {
        "word": "der Hörer",
        "article": "der",
        "pos": "noun",
        "translation": "listener, receiver"
      },
      {
        "word": "die Hörsaal",
        "article": "der",
        "pos": "noun",
        "translation": "lecture hall"
      },
      {
        "word": "hörbar",
        "article": null,
        "pos": "adjective",
        "translation": "audible"
      },
      {
        "word": "ungeheuer",
        "article": null,
        "pos": "adjective",
        "translation": "tremendous, monstrous"
      }
    ],
    "prefixes": [
      {
        "word": "gehören",
        "prefix": "ge-",
        "article": null,
        "pos": "verb",
        "translation": "to belong to"
      },
      {
        "word": "verhören",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to interrogate, mishear (sich)"
      },
      {
        "word": "erhören",
        "prefix": "er-",
        "article": null,
        "pos": "verb",
        "translation": "to grant, hear (prayer)"
      }
    ],
    "separableVerbs": [
      {
        "word": "aufhören",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to stop, cease, quit"
      },
      {
        "word": "anhören",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to listen to, sound like"
      },
      {
        "word": "zuhören",
        "prefix": "zu-",
        "article": null,
        "pos": "verb",
        "translation": "to listen attentively"
      },
      {
        "word": "abhören",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to bug, wiretap, examine (lungs)"
      },
      {
        "word": "mithören",
        "prefix": "mit-",
        "article": null,
        "pos": "verb",
        "translation": "to listen in, overhear"
      },
      {
        "word": "weghören",
        "prefix": "weg-",
        "article": null,
        "pos": "verb",
        "translation": "to ignore, turn a deaf ear"
      }
    ],
    "suffixes": [
      {
        "word": "hörbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "audible"
      },
      {
        "word": "die Hörbarkeit",
        "suffix": "-keit",
        "article": "die",
        "pos": "noun",
        "translation": "audibility"
      }
    ]
  },
  "hol": {
    "root": "hol",
    "base": "holen",
    "wordFamily": [
      {
        "word": "die Erholung",
        "article": "die",
        "pos": "noun",
        "translation": "recovery, rest, recreation"
      },
      {
        "word": "die Wiederholung",
        "article": "die",
        "pos": "noun",
        "translation": "repetition, rerun"
      },
      {
        "word": "erholsam",
        "article": null,
        "pos": "adjective",
        "translation": "relaxing, restful"
      }
    ],
    "prefixes": [
      {
        "word": "erholen",
        "prefix": "er-",
        "article": null,
        "pos": "verb",
        "translation": "to recover, relax, recuperate"
      },
      {
        "word": "wiederholen",
        "prefix": "wieder-",
        "article": null,
        "pos": "verb",
        "translation": "to repeat, review"
      }
    ],
    "separableVerbs": [
      {
        "word": "abholen",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to pick up, fetch"
      },
      {
        "word": "aufholen",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to catch up"
      },
      {
        "word": "einholen",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to overtake, obtain (permission)"
      },
      {
        "word": "nachholen",
        "prefix": "nach-",
        "article": null,
        "pos": "verb",
        "translation": "to make up for, catch up on"
      },
      {
        "word": "ausholen",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to swing out, elaborate broadly"
      },
      {
        "word": "zurückholen",
        "prefix": "zurück-",
        "article": null,
        "pos": "verb",
        "translation": "to bring back, retrieve"
      }
    ],
    "suffixes": [
      {
        "word": "die Erholung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "recreation"
      },
      {
        "word": "erholsam",
        "suffix": "-sam",
        "article": null,
        "pos": "adjective",
        "translation": "relaxing"
      }
    ]
  },
  "zieh": {
    "root": "zieh",
    "base": "ziehen",
    "wordFamily": [
      {
        "word": "der Zug",
        "article": "der",
        "pos": "noun",
        "translation": "train, move, draft, trait"
      },
      {
        "word": "die Beziehung",
        "article": "die",
        "pos": "noun",
        "translation": "relationship, connection"
      },
      {
        "word": "der Anzug",
        "article": "der",
        "pos": "noun",
        "translation": "suit (clothing)"
      },
      {
        "word": "der Umzug",
        "article": "der",
        "pos": "noun",
        "translation": "relocation, move, parade"
      },
      {
        "word": "die Erziehung",
        "article": "die",
        "pos": "noun",
        "translation": "upbringing, education"
      },
      {
        "word": "anziehend",
        "article": null,
        "pos": "adjective",
        "translation": "attractive, appealing"
      }
    ],
    "prefixes": [
      {
        "word": "beziehen",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to refer to, obtain, move into"
      },
      {
        "word": "erziehen",
        "prefix": "er-",
        "article": null,
        "pos": "verb",
        "translation": "to raise, educate, bring up"
      },
      {
        "word": "entziehen",
        "prefix": "ent-",
        "article": null,
        "pos": "verb",
        "translation": "to withdraw, deprive, evade"
      },
      {
        "word": "verziehen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to forgive, warp, spoil (child)"
      }
    ],
    "separableVerbs": [
      {
        "word": "umziehen",
        "prefix": "um-",
        "article": null,
        "pos": "verb",
        "translation": "to move house, change clothes"
      },
      {
        "word": "anziehen",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to put on (clothes), attract, tighten"
      },
      {
        "word": "ausziehen",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to take off (clothes), move out"
      },
      {
        "word": "abziehen",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to deduct, withdraw, peel off"
      },
      {
        "word": "aufziehen",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to raise, wind up, tease"
      },
      {
        "word": "einziehen",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to move in, collect, absorb"
      },
      {
        "word": "vorziehen",
        "prefix": "vor-",
        "article": null,
        "pos": "verb",
        "translation": "to prefer, draw forward"
      },
      {
        "word": "wegziehen",
        "prefix": "weg-",
        "article": null,
        "pos": "verb",
        "translation": "to move away, pull away"
      },
      {
        "word": "zurückziehen",
        "prefix": "zurück-",
        "article": null,
        "pos": "verb",
        "translation": "to withdraw, retreat, retract"
      },
      {
        "word": "zuziehen",
        "prefix": "zu-",
        "article": null,
        "pos": "verb",
        "translation": "to pull shut, consult, move into town"
      }
    ],
    "suffixes": [
      {
        "word": "die Erziehung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "education"
      },
      {
        "word": "ziehbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "ductile, pullable"
      }
    ]
  },
  "denk": {
    "root": "denk",
    "base": "denken",
    "wordFamily": [
      {
        "word": "der Gedanke",
        "article": "der",
        "pos": "noun",
        "translation": "thought, idea"
      },
      {
        "word": "das Denken",
        "article": "das",
        "pos": "noun",
        "translation": "thinking, mindset"
      },
      {
        "word": "das Denkmal",
        "article": "das",
        "pos": "noun",
        "translation": "monument, memorial"
      },
      {
        "word": "denkbar",
        "article": null,
        "pos": "adjective",
        "translation": "conceivable, thinkable"
      },
      {
        "word": "gedankenlos",
        "article": null,
        "pos": "adjective",
        "translation": "thoughtless"
      }
    ],
    "prefixes": [
      {
        "word": "bedenken",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to consider, ponder"
      },
      {
        "word": "überdenken",
        "prefix": "über-",
        "article": null,
        "pos": "verb",
        "translation": "to rethink, reconsider"
      },
      {
        "word": "erdenken",
        "prefix": "er-",
        "article": null,
        "pos": "verb",
        "translation": "to devise, conceive"
      }
    ],
    "separableVerbs": [
      {
        "word": "nachdenken",
        "prefix": "nach-",
        "article": null,
        "pos": "verb",
        "translation": "to reflect, contemplate, ponder"
      },
      {
        "word": "ausdenken",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to invent, concoct, figure out"
      },
      {
        "word": "mitdenken",
        "prefix": "mit-",
        "article": null,
        "pos": "verb",
        "translation": "to follow along mentally, anticipate"
      },
      {
        "word": "umdenken",
        "prefix": "um-",
        "article": null,
        "pos": "verb",
        "translation": "to change one's mindset"
      },
      {
        "word": "vorausdenken",
        "prefix": "voraus-",
        "article": null,
        "pos": "verb",
        "translation": "to plan ahead, think forward"
      },
      {
        "word": "andenken",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to contemplate tentatively"
      }
    ],
    "suffixes": [
      {
        "word": "denkbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "thinkable"
      },
      {
        "word": "die Denkbarkeit",
        "suffix": "-keit",
        "article": "die",
        "pos": "noun",
        "translation": "conceivability"
      }
    ]
  },
  "zeig": {
    "root": "zeig",
    "base": "zeigen",
    "wordFamily": [
      {
        "word": "der Zeiger",
        "article": "der",
        "pos": "noun",
        "translation": "hand (clock), pointer"
      },
      {
        "word": "die Anzeige",
        "article": "die",
        "pos": "noun",
        "translation": "ad, notification, display"
      },
      {
        "word": "das Zeugnis",
        "article": "das",
        "pos": "noun",
        "translation": "certificate, report card, testimony"
      }
    ],
    "prefixes": [
      {
        "word": "bezeugen",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to testify, witness"
      },
      {
        "word": "überzeugen",
        "prefix": "über-",
        "article": null,
        "pos": "verb",
        "translation": "to convince, persuade"
      },
      {
        "word": "erzeigen",
        "prefix": "er-",
        "article": null,
        "pos": "verb",
        "translation": "to render (favor)"
      }
    ],
    "separableVerbs": [
      {
        "word": "anzeigen",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to report (police), display, indicate"
      },
      {
        "word": "aufzeigen",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to demonstrate, point out, highlight"
      },
      {
        "word": "vorzeigen",
        "prefix": "vor-",
        "article": null,
        "pos": "verb",
        "translation": "to show, produce (ticket/ID)"
      }
    ],
    "suffixes": [
      {
        "word": "zeigbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "presentable"
      }
    ]
  },
  "schalt": {
    "root": "schalt",
    "base": "schalten",
    "wordFamily": [
      {
        "word": "der Schalter",
        "article": "der",
        "pos": "noun",
        "translation": "switch, counter, ticket window"
      },
      {
        "word": "die Schaltung",
        "article": "die",
        "pos": "noun",
        "translation": "circuit, transmission, gearing"
      }
    ],
    "prefixes": [
      {
        "word": "beschalten",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to wire, connect"
      },
      {
        "word": "verschalten",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to interlink, wire"
      }
    ],
    "separableVerbs": [
      {
        "word": "einschalten",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to switch on, involve"
      },
      {
        "word": "ausschalten",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to switch off, eliminate"
      },
      {
        "word": "umschalten",
        "prefix": "um-",
        "article": null,
        "pos": "verb",
        "translation": "to switch channels/modes"
      },
      {
        "word": "abschalten",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to shut down, relax"
      },
      {
        "word": "anschalten",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to turn on, power up"
      },
      {
        "word": "zuschalten",
        "prefix": "zu-",
        "article": null,
        "pos": "verb",
        "translation": "to connect, bring in live (stream)"
      },
      {
        "word": "vorschalten",
        "prefix": "vor-",
        "article": null,
        "pos": "verb",
        "translation": "to prefix, connect upstream"
      }
    ],
    "suffixes": [
      {
        "word": "die Schaltung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "circuit"
      },
      {
        "word": "schaltbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "switchable"
      }
    ]
  },
  "leg": {
    "root": "leg",
    "base": "legen",
    "wordFamily": [
      {
        "word": "die Lage",
        "article": "die",
        "pos": "noun",
        "translation": "situation, location, layer"
      },
      {
        "word": "die Anlage",
        "article": "die",
        "pos": "noun",
        "translation": "system, attachment, investment"
      },
      {
        "word": "die Beilage",
        "article": "die",
        "pos": "noun",
        "translation": "side dish, enclosure"
      },
      {
        "word": "die Vorlage",
        "article": "die",
        "pos": "noun",
        "translation": "template, submission, assist"
      },
      {
        "word": "gelegen",
        "article": null,
        "pos": "adjective",
        "translation": "situated, convenient"
      }
    ],
    "prefixes": [
      {
        "word": "belegen",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to occupy, prove, enroll in"
      },
      {
        "word": "verlegen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to publish, misplace, reschedule"
      },
      {
        "word": "erlegen",
        "prefix": "er-",
        "article": null,
        "pos": "verb",
        "translation": "to kill (game)"
      },
      {
        "word": "überlegen",
        "prefix": "über-",
        "article": null,
        "pos": "verb",
        "translation": "to reflect, consider / superior"
      }
    ],
    "separableVerbs": [
      {
        "word": "ablegen",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to take off (coat), take (exam), file"
      },
      {
        "word": "anlegen",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to invest, create, put on"
      },
      {
        "word": "auflegen",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to hang up (phone), release (album)"
      },
      {
        "word": "auslegen",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to interpret, display, front money"
      },
      {
        "word": "beilegen",
        "prefix": "bei-",
        "article": null,
        "pos": "verb",
        "translation": "to enclose, settle (dispute)"
      },
      {
        "word": "einlegen",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to insert, pickle, lodge (appeal)"
      },
      {
        "word": "vorlegen",
        "prefix": "vor-",
        "article": null,
        "pos": "verb",
        "translation": "to present, submit, produce"
      },
      {
        "word": "weglegen",
        "prefix": "weg-",
        "article": null,
        "pos": "verb",
        "translation": "to put away"
      },
      {
        "word": "zulegen",
        "prefix": "zu-",
        "article": null,
        "pos": "verb",
        "translation": "to acquire, gain speed"
      },
      {
        "word": "zurücklegen",
        "prefix": "zurück-",
        "article": null,
        "pos": "verb",
        "translation": "to cover (distance), save up"
      }
    ],
    "suffixes": [
      {
        "word": "die Ablage",
        "suffix": "-e",
        "article": "die",
        "pos": "noun",
        "translation": "filing, tray"
      },
      {
        "word": "legbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "layable"
      }
    ]
  },
  "teil": {
    "root": "teil",
    "base": "teilen",
    "wordFamily": [
      {
        "word": "der Teil",
        "article": "der",
        "pos": "noun",
        "translation": "part, section, portion"
      },
      {
        "word": "das Teilchen",
        "article": "das",
        "pos": "noun",
        "translation": "particle"
      },
      {
        "word": "die Abteilung",
        "article": "die",
        "pos": "noun",
        "translation": "department, division"
      },
      {
        "word": "das Urteil",
        "article": "das",
        "pos": "noun",
        "translation": "judgment, verdict"
      },
      {
        "word": "der Vorteil",
        "article": "der",
        "pos": "noun",
        "translation": "advantage, benefit"
      },
      {
        "word": "der Nachteil",
        "article": "der",
        "pos": "noun",
        "translation": "disadvantage"
      },
      {
        "word": "teilweise",
        "article": null,
        "pos": "adjective",
        "translation": "partly, partially"
      }
    ],
    "prefixes": [
      {
        "word": "verteilen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to distribute, allocate"
      },
      {
        "word": "beurteilen",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to judge, evaluate, assess"
      },
      {
        "word": "erteilen",
        "prefix": "er-",
        "article": null,
        "pos": "verb",
        "translation": "to grant, issue (permission)"
      }
    ],
    "separableVerbs": [
      {
        "word": "mitteilen",
        "prefix": "mit-",
        "article": null,
        "pos": "verb",
        "translation": "to inform, communicate, share"
      },
      {
        "word": "einteilen",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to categorize, allocate, divide"
      },
      {
        "word": "austeilen",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to dish out, distribute"
      },
      {
        "word": "zuteilen",
        "prefix": "zu-",
        "article": null,
        "pos": "verb",
        "translation": "to assign, apportion"
      },
      {
        "word": "abteilen",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to partition, separate"
      }
    ],
    "suffixes": [
      {
        "word": "die Mitteilung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "notification"
      },
      {
        "word": "teilbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "divisible"
      },
      {
        "word": "die Teilbarkeit",
        "suffix": "-keit",
        "article": "die",
        "pos": "noun",
        "translation": "divisibility"
      }
    ]
  },
  "drück": {
    "root": "drück",
    "base": "drücken",
    "wordFamily": [
      {
        "word": "der Druck",
        "article": "der",
        "pos": "noun",
        "translation": "pressure, printing, stress"
      },
      {
        "word": "der Ausdruck",
        "article": "der",
        "pos": "noun",
        "translation": "expression, phrase, printout"
      },
      {
        "word": "der Eindruck",
        "article": "der",
        "pos": "noun",
        "translation": "impression"
      },
      {
        "word": "ausdrücklich",
        "article": null,
        "pos": "adjective",
        "translation": "express, explicit"
      },
      {
        "word": "eindrucksvoll",
        "article": null,
        "pos": "adjective",
        "translation": "impressive"
      }
    ],
    "prefixes": [
      {
        "word": "bedrücken",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to depress, weigh upon"
      },
      {
        "word": "unterdrücken",
        "prefix": "unter-",
        "article": null,
        "pos": "verb",
        "translation": "to suppress, oppress"
      },
      {
        "word": "verdrücken",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to wolf down, sneak away (sich)"
      }
    ],
    "separableVerbs": [
      {
        "word": "ausdrücken",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to express, squeeze out"
      },
      {
        "word": "abdrücken",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to pull the trigger, pay up"
      },
      {
        "word": "aufdrücken",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to imprint, force onto"
      },
      {
        "word": "eindrücken",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to push in, dent"
      },
      {
        "word": "nachdrücken",
        "prefix": "nach-",
        "article": null,
        "pos": "verb",
        "translation": "to repress, push again"
      },
      {
        "word": "wegdrücken",
        "prefix": "weg-",
        "article": null,
        "pos": "verb",
        "translation": "to push away, reject (call)"
      },
      {
        "word": "zudrücken",
        "prefix": "zu-",
        "article": null,
        "pos": "verb",
        "translation": "to squeeze shut, turn a blind eye"
      }
    ],
    "suffixes": [
      {
        "word": "der Ausdruck",
        "suffix": "-druck",
        "article": "der",
        "pos": "noun",
        "translation": "expression"
      },
      {
        "word": "drückbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "pressable"
      }
    ]
  },
  "biet": {
    "root": "biet",
    "base": "bieten",
    "wordFamily": [
      {
        "word": "das Angebot",
        "article": "das",
        "pos": "noun",
        "translation": "offer, supply, bargain"
      },
      {
        "word": "der Bieter",
        "article": "der",
        "pos": "noun",
        "translation": "bidder"
      },
      {
        "word": "das Gebot",
        "article": "das",
        "pos": "noun",
        "translation": "commandment, bid, requirement"
      },
      {
        "word": "das Verbot",
        "article": "das",
        "pos": "noun",
        "translation": "ban, prohibition"
      }
    ],
    "prefixes": [
      {
        "word": "verbieten",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to forbid, prohibit"
      },
      {
        "word": "gebieten",
        "prefix": "ge-",
        "article": null,
        "pos": "verb",
        "translation": "to command, order"
      }
    ],
    "separableVerbs": [
      {
        "word": "anbieten",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to offer, provide"
      },
      {
        "word": "aufbieten",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to summon, mobilize"
      },
      {
        "word": "darbieten",
        "prefix": "dar-",
        "article": null,
        "pos": "verb",
        "translation": "to present, perform"
      },
      {
        "word": "mitbieten",
        "prefix": "mit-",
        "article": null,
        "pos": "verb",
        "translation": "to bid alongside"
      }
    ],
    "suffixes": [
      {
        "word": "bietbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "biddable"
      }
    ]
  },
  "kauf": {
    "root": "kauf",
    "base": "kaufen",
    "wordFamily": [
      {
        "word": "der Kauf",
        "article": "der",
        "pos": "noun",
        "translation": "purchase, buy"
      },
      {
        "word": "der Verkäufer",
        "article": "der",
        "pos": "noun",
        "translation": "seller, salesperson"
      },
      {
        "word": "der Einkauf",
        "article": "der",
        "pos": "noun",
        "translation": "shopping, purchase"
      },
      {
        "word": "die Kaufkraft",
        "article": "die",
        "pos": "noun",
        "translation": "purchasing power"
      },
      {
        "word": "käuflich",
        "article": null,
        "pos": "adjective",
        "translation": "purchasable, corruptible"
      }
    ],
    "prefixes": [
      {
        "word": "verkaufen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to sell"
      },
      {
        "word": "erkaufen",
        "prefix": "er-",
        "article": null,
        "pos": "verb",
        "translation": "to buy, purchase (with sacrifice)"
      }
    ],
    "separableVerbs": [
      {
        "word": "einkaufen",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to go shopping, purchase"
      },
      {
        "word": "abkaufen",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to buy from someone"
      },
      {
        "word": "ankaufen",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to purchase, acquire (collector)"
      },
      {
        "word": "aufkaufen",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to buy up, corner market"
      },
      {
        "word": "zukaufen",
        "prefix": "zu-",
        "article": null,
        "pos": "verb",
        "translation": "to buy additional items"
      }
    ],
    "suffixes": [
      {
        "word": "käuflich",
        "suffix": "-lich",
        "article": null,
        "pos": "adjective",
        "translation": "available for purchase"
      },
      {
        "word": "die Käuflichkeit",
        "suffix": "-keit",
        "article": "die",
        "pos": "noun",
        "translation": "corruptibility"
      }
    ]
  },
  "stimm": {
    "root": "stimm",
    "base": "stimmen",
    "wordFamily": [
      {
        "word": "die Stimme",
        "article": "die",
        "pos": "noun",
        "translation": "voice, vote"
      },
      {
        "word": "die Stimmung",
        "article": "die",
        "pos": "noun",
        "translation": "mood, atmosphere, tuning"
      },
      {
        "word": "die Zustimmung",
        "article": "die",
        "pos": "noun",
        "translation": "approval, consent, agreement"
      },
      {
        "word": "die Abstimmung",
        "article": "die",
        "pos": "noun",
        "translation": "vote, ballot, coordination"
      },
      {
        "word": "stimmig",
        "article": null,
        "pos": "adjective",
        "translation": "coherent, consistent"
      },
      {
        "word": "einstimmig",
        "article": null,
        "pos": "adjective",
        "translation": "unanimous"
      }
    ],
    "prefixes": [
      {
        "word": "bestimmen",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to determine, decide, define"
      },
      {
        "word": "verstimmen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to untune, upset"
      }
    ],
    "separableVerbs": [
      {
        "word": "zustimmen",
        "prefix": "zu-",
        "article": null,
        "pos": "verb",
        "translation": "to agree, approve, concur"
      },
      {
        "word": "abstimmen",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to vote on, coordinate, tune"
      },
      {
        "word": "einstimmen",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to join in, attune to"
      },
      {
        "word": "anstimmen",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to strike up (song), intone"
      },
      {
        "word": "umstimmen",
        "prefix": "um-",
        "article": null,
        "pos": "verb",
        "translation": "to change someone's mind"
      },
      {
        "word": "mitstimmen",
        "prefix": "mit-",
        "article": null,
        "pos": "verb",
        "translation": "to vote along"
      }
    ],
    "suffixes": [
      {
        "word": "die Bestimmung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "regulation, destination"
      },
      {
        "word": "stimmbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "tunable"
      }
    ]
  },
  "sag": {
    "root": "sag",
    "base": "sagen",
    "wordFamily": [
      {
        "word": "die Sage",
        "article": "die",
        "pos": "noun",
        "translation": "legend, myth"
      },
      {
        "word": "die Aussage",
        "article": "die",
        "pos": "noun",
        "translation": "statement, testimony, message"
      },
      {
        "word": "die Absage",
        "article": "die",
        "pos": "noun",
        "translation": "cancellation, rejection"
      },
      {
        "word": "die Zusage",
        "article": "die",
        "pos": "noun",
        "translation": "acceptance, promise, confirmation"
      },
      {
        "word": "die Ansage",
        "article": "die",
        "pos": "noun",
        "translation": "announcement"
      },
      {
        "word": "aussagekräftig",
        "article": null,
        "pos": "adjective",
        "translation": "meaningful, informative"
      }
    ],
    "prefixes": [
      {
        "word": "besagen",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to say, mean, indicate"
      },
      {
        "word": "versagen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to fail, malfunction, refuse"
      },
      {
        "word": "entsagen",
        "prefix": "ent-",
        "article": null,
        "pos": "verb",
        "translation": "to renounce, forgo"
      }
    ],
    "separableVerbs": [
      {
        "word": "absagen",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to cancel, call off"
      },
      {
        "word": "zusagen",
        "prefix": "zu-",
        "article": null,
        "pos": "verb",
        "translation": "to accept, promise, appeal to"
      },
      {
        "word": "ansagen",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to announce, declare"
      },
      {
        "word": "aussagen",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to testify, state, express"
      },
      {
        "word": "aufsagen",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to recite, recite by heart"
      },
      {
        "word": "vorhersagen",
        "prefix": "vorher-",
        "article": null,
        "pos": "verb",
        "translation": "to predict, forecast"
      },
      {
        "word": "vorsagen",
        "prefix": "vor-",
        "article": null,
        "pos": "verb",
        "translation": "to prompt, whisper answer"
      },
      {
        "word": "weitersagen",
        "prefix": "weiter-",
        "article": null,
        "pos": "verb",
        "translation": "to pass on (rumor/secret)"
      }
    ],
    "suffixes": [
      {
        "word": "sagbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "utterable"
      }
    ]
  },
  "spiel": {
    "root": "spiel",
    "base": "spielen",
    "wordFamily": [
      {
        "word": "das Spiel",
        "article": "das",
        "pos": "noun",
        "translation": "game, play, match"
      },
      {
        "word": "der Spieler",
        "article": "der",
        "pos": "noun",
        "translation": "player, gambler"
      },
      {
        "word": "das Beispiel",
        "article": "das",
        "pos": "noun",
        "translation": "example, instance"
      },
      {
        "word": "der Spielplatz",
        "article": "der",
        "pos": "noun",
        "translation": "playground"
      },
      {
        "word": "spielerisch",
        "article": null,
        "pos": "adjective",
        "translation": "playful, effortless"
      }
    ],
    "prefixes": [
      {
        "word": "verspielen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to gamble away, forfeit"
      },
      {
        "word": "bespielen",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to perform on, record onto"
      }
    ],
    "separableVerbs": [
      {
        "word": "abspielen",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to play (audio), happen (sich)"
      },
      {
        "word": "anspielen",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to hint at, allude to"
      },
      {
        "word": "aufspielen",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to install (software), show off"
      },
      {
        "word": "ausspielen",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to play off against, lead (card)"
      },
      {
        "word": "einspielen",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to warm up, bring in (revenue)"
      },
      {
        "word": "mitspielen",
        "prefix": "mit-",
        "article": null,
        "pos": "verb",
        "translation": "to play along, participate"
      },
      {
        "word": "vorspielen",
        "prefix": "vor-",
        "article": null,
        "pos": "verb",
        "translation": "to audition, pretend"
      },
      {
        "word": "zusammenspielen",
        "prefix": "zusammen-",
        "article": null,
        "pos": "verb",
        "translation": "to team up, coordinate"
      }
    ],
    "suffixes": [
      {
        "word": "spielerisch",
        "suffix": "-isch",
        "article": null,
        "pos": "adjective",
        "translation": "playful"
      },
      {
        "word": "spielbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "playable"
      }
    ]
  },
  "frag": {
    "root": "frag",
    "base": "fragen",
    "wordFamily": [
      {
        "word": "die Frage",
        "article": "die",
        "pos": "noun",
        "translation": "question, issue"
      },
      {
        "word": "die Nachfrage",
        "article": "die",
        "pos": "noun",
        "translation": "demand, inquiry"
      },
      {
        "word": "die Umfrage",
        "article": "die",
        "pos": "noun",
        "translation": "survey, poll"
      },
      {
        "word": "fraglich",
        "article": null,
        "pos": "adjective",
        "translation": "questionable, doubtful"
      },
      {
        "word": "fragwürdig",
        "article": null,
        "pos": "adjective",
        "translation": "dubious, shady"
      }
    ],
    "prefixes": [
      {
        "word": "befragen",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to interview, interrogate, survey"
      },
      {
        "word": "erfragen",
        "prefix": "er-",
        "article": null,
        "pos": "verb",
        "translation": "to inquire and find out"
      }
    ],
    "separableVerbs": [
      {
        "word": "nachfragen",
        "prefix": "nach-",
        "article": null,
        "pos": "verb",
        "translation": "to enquire, follow up with questions"
      },
      {
        "word": "abfragen",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to quiz, poll, query"
      },
      {
        "word": "anfragen",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to request, solicit quote"
      },
      {
        "word": "ausfragen",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to interrogate, pump for info"
      }
    ],
    "suffixes": [
      {
        "word": "fraglich",
        "suffix": "-lich",
        "article": null,
        "pos": "adjective",
        "translation": "doubtful"
      },
      {
        "word": "die Fragestellung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "problem formulation"
      }
    ]
  },
  "lauf": {
    "root": "lauf",
    "base": "laufen",
    "wordFamily": [
      {
        "word": "der Lauf",
        "article": "der",
        "pos": "noun",
        "translation": "run, course, barrel"
      },
      {
        "word": "der Ablauf",
        "article": "der",
        "pos": "noun",
        "translation": "procedure, expiration, sequence"
      },
      {
        "word": "die Laufbahn",
        "article": "die",
        "pos": "noun",
        "translation": "career, running track"
      },
      {
        "word": "laufend",
        "article": null,
        "pos": "adjective",
        "translation": "ongoing, current"
      },
      {
        "word": "geläufig",
        "article": null,
        "pos": "adjective",
        "translation": "familiar, common"
      }
    ],
    "prefixes": [
      {
        "word": "belaufen",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to amount to (sich)"
      },
      {
        "word": "verlaufen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to proceed, lose one's way"
      },
      {
        "word": "entlaufen",
        "prefix": "ent-",
        "article": null,
        "pos": "verb",
        "translation": "to run away, escape"
      }
    ],
    "separableVerbs": [
      {
        "word": "ablaufen",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to expire, run off, proceed"
      },
      {
        "word": "anlaufen",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to start up, call at port, tarnish"
      },
      {
        "word": "auflaufen",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to run aground, accumulate"
      },
      {
        "word": "auslaufen",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to leak, phase out, set sail"
      },
      {
        "word": "einlaufen",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to shrink, arrive (train/ship)"
      },
      {
        "word": "mitlaufen",
        "prefix": "mit-",
        "article": null,
        "pos": "verb",
        "translation": "to run along, follow blindly"
      },
      {
        "word": "nachlaufen",
        "prefix": "nach-",
        "article": null,
        "pos": "verb",
        "translation": "to chase after"
      },
      {
        "word": "vorlaufen",
        "prefix": "vor-",
        "article": null,
        "pos": "verb",
        "translation": "to run ahead, be fast (clock)"
      },
      {
        "word": "weglaufen",
        "prefix": "weg-",
        "article": null,
        "pos": "verb",
        "translation": "to run away"
      },
      {
        "word": "weiterlaufen",
        "prefix": "weiter-",
        "article": null,
        "pos": "verb",
        "translation": "to keep running"
      },
      {
        "word": "zurücklaufen",
        "prefix": "zurück-",
        "article": null,
        "pos": "verb",
        "translation": "to run back"
      }
    ],
    "suffixes": [
      {
        "word": "laufbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "walkable, runnable"
      }
    ]
  },
  "trag": {
    "root": "trag",
    "base": "tragen",
    "wordFamily": [
      {
        "word": "der Träger",
        "article": "der",
        "pos": "noun",
        "translation": "bearer, strap, sponsor"
      },
      {
        "word": "der Beitrag",
        "article": "der",
        "pos": "noun",
        "translation": "contribution, post, fee"
      },
      {
        "word": "der Vertrag",
        "article": "der",
        "pos": "noun",
        "translation": "contract, treaty"
      },
      {
        "word": "der Vortrag",
        "article": "der",
        "pos": "noun",
        "translation": "lecture, presentation"
      },
      {
        "word": "der Ertrag",
        "article": "der",
        "pos": "noun",
        "translation": "yield, profit, return"
      },
      {
        "word": "tragbar",
        "article": null,
        "pos": "adjective",
        "translation": "portable, acceptable"
      },
      {
        "word": "erträglich",
        "article": null,
        "pos": "adjective",
        "translation": "bearable, tolerable"
      }
    ],
    "prefixes": [
      {
        "word": "vertragen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to tolerate, make peace (sich)"
      },
      {
        "word": "ertragen",
        "prefix": "er-",
        "article": null,
        "pos": "verb",
        "translation": "to endure, bear, stand"
      },
      {
        "word": "betragen",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to amount to, behave (sich)"
      },
      {
        "word": "übertragen",
        "prefix": "über-",
        "article": null,
        "pos": "verb",
        "translation": "to broadcast, transfer, transmit"
      }
    ],
    "separableVerbs": [
      {
        "word": "beitragen",
        "prefix": "bei-",
        "article": null,
        "pos": "verb",
        "translation": "to contribute to"
      },
      {
        "word": "eintragen",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to register, enter, enroll"
      },
      {
        "word": "vortragen",
        "prefix": "vor-",
        "article": null,
        "pos": "verb",
        "translation": "to recite, deliver, present"
      },
      {
        "word": "abtragen",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to erode, pay off (debt), clear away"
      },
      {
        "word": "antragen",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to propose, offer"
      },
      {
        "word": "auftragen",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to apply (paint), instruct, serve"
      },
      {
        "word": "austragen",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to deliver (mail), host (match)"
      },
      {
        "word": "nachtragen",
        "prefix": "nach-",
        "article": null,
        "pos": "verb",
        "translation": "to append, hold a grudge"
      },
      {
        "word": "wegtragen",
        "prefix": "weg-",
        "article": null,
        "pos": "verb",
        "translation": "to carry away"
      },
      {
        "word": "zurücktragen",
        "prefix": "zurück-",
        "article": null,
        "pos": "verb",
        "translation": "to carry back"
      }
    ],
    "suffixes": [
      {
        "word": "tragbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "portable"
      },
      {
        "word": "die Tragbarkeit",
        "suffix": "-keit",
        "article": "die",
        "pos": "noun",
        "translation": "portability"
      }
    ]
  },
  "lass": {
    "root": "lass",
    "base": "lassen",
    "wordFamily": [
      {
        "word": "der Anlass",
        "article": "der",
        "pos": "noun",
        "translation": "occasion, cause, reason"
      },
      {
        "word": "die Zulassung",
        "article": "die",
        "pos": "noun",
        "translation": "admission, registration, license"
      },
      {
        "word": "der Erlass",
        "article": "der",
        "pos": "noun",
        "translation": "decree, remission (debt)"
      },
      {
        "word": "lässig",
        "article": null,
        "pos": "adjective",
        "translation": "casual, nonchalant"
      },
      {
        "word": "verlässlich",
        "article": null,
        "pos": "adjective",
        "translation": "reliable, dependable"
      }
    ],
    "prefixes": [
      {
        "word": "verlassen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to leave, abandon, rely upon (sich)"
      },
      {
        "word": "entlassen",
        "prefix": "ent-",
        "article": null,
        "pos": "verb",
        "translation": "to dismiss, fire, discharge"
      },
      {
        "word": "erlassen",
        "prefix": "er-",
        "article": null,
        "pos": "verb",
        "translation": "to issue (decree), waive (penalty)"
      },
      {
        "word": "überlassen",
        "prefix": "über-",
        "article": null,
        "pos": "verb",
        "translation": "to leave to, surrender"
      }
    ],
    "separableVerbs": [
      {
        "word": "zulassen",
        "prefix": "zu-",
        "article": null,
        "pos": "verb",
        "translation": "to permit, authorize, leave closed"
      },
      {
        "word": "anlassen",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to start (engine), leave on (clothes)"
      },
      {
        "word": "auflassen",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to leave open, keep hat on"
      },
      {
        "word": "auslassen",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to omit, vent (anger), skip"
      },
      {
        "word": "einlassen",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to admit, get involved with (sich)"
      },
      {
        "word": "nachlassen",
        "prefix": "nach-",
        "article": null,
        "pos": "verb",
        "translation": "to subside, abate, deteriorate"
      },
      {
        "word": "vorlassen",
        "prefix": "vor-",
        "article": null,
        "pos": "verb",
        "translation": "to let someone go first"
      },
      {
        "word": "weglassen",
        "prefix": "weg-",
        "article": null,
        "pos": "verb",
        "translation": "to leave out, omit"
      },
      {
        "word": "zurücklassen",
        "prefix": "zurück-",
        "article": null,
        "pos": "verb",
        "translation": "to leave behind"
      }
    ],
    "suffixes": [
      {
        "word": "die Zulassung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "admission"
      },
      {
        "word": "verlässlich",
        "suffix": "-lich",
        "article": null,
        "pos": "adjective",
        "translation": "reliable"
      }
    ]
  },
  "wickel": {
    "root": "wickel",
    "base": "wickeln",
    "wordFamily": [
      {
        "word": "die Entwicklung",
        "article": "die",
        "pos": "noun",
        "translation": "development, evolution"
      },
      {
        "word": "der Entwickler",
        "article": "der",
        "pos": "noun",
        "translation": "developer, creator"
      },
      {
        "word": "das Entwicklungsland",
        "article": "das",
        "pos": "noun",
        "translation": "developing country"
      },
      {
        "word": "die Wicklung",
        "article": "die",
        "pos": "noun",
        "translation": "winding, coil"
      },
      {
        "word": "entwickelt",
        "article": null,
        "pos": "adjective",
        "translation": "developed, sophisticated"
      }
    ],
    "prefixes": [
      {
        "word": "entwickeln",
        "prefix": "ent-",
        "article": null,
        "pos": "verb",
        "translation": "to develop, evolve, engineer"
      },
      {
        "word": "verwickeln",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to entangle, implicate, embroil"
      }
    ],
    "separableVerbs": [
      {
        "word": "abwickeln",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to process, manage, unwind"
      },
      {
        "word": "aufwickeln",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to roll up, wind up"
      },
      {
        "word": "auswickeln",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to unwrap"
      },
      {
        "word": "einwickeln",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to wrap up, envelope"
      },
      {
        "word": "umwickeln",
        "prefix": "um-",
        "article": null,
        "pos": "verb",
        "translation": "to wind around, wrap"
      }
    ],
    "suffixes": [
      {
        "word": "die Entwicklung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "development"
      },
      {
        "word": "entwickelbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "developable"
      }
    ]
  },
  "schau": {
    "root": "schau",
    "base": "schauen",
    "wordFamily": [
      {
        "word": "die Schau",
        "article": "die",
        "pos": "noun",
        "translation": "show, exhibition, display"
      },
      {
        "word": "der Zuschauer",
        "article": "der",
        "pos": "noun",
        "translation": "spectator, viewer"
      },
      {
        "word": "die Vorschau",
        "article": "die",
        "pos": "noun",
        "translation": "preview, outlook"
      },
      {
        "word": "anschaulich",
        "article": null,
        "pos": "adjective",
        "translation": "vivid, illustrative, clear"
      }
    ],
    "prefixes": [
      {
        "word": "beschauen",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to inspect, scrutinize"
      },
      {
        "word": "verschauen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to fall for someone (sich)"
      }
    ],
    "separableVerbs": [
      {
        "word": "anschauen",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to look at, watch"
      },
      {
        "word": "zuschauen",
        "prefix": "zu-",
        "article": null,
        "pos": "verb",
        "translation": "to watch, look on"
      },
      {
        "word": "ausschauen",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to look out, look like"
      },
      {
        "word": "abschauen",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to copy, learn by watching"
      },
      {
        "word": "aufschauen",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to look up (to)"
      },
      {
        "word": "durchschauen",
        "prefix": "durch-",
        "article": null,
        "pos": "verb",
        "translation": "to see through (deception)"
      },
      {
        "word": "nachschauen",
        "prefix": "nach-",
        "article": null,
        "pos": "verb",
        "translation": "to check, look up"
      },
      {
        "word": "umschauen",
        "prefix": "um-",
        "article": null,
        "pos": "verb",
        "translation": "to look around"
      },
      {
        "word": "vorschauen",
        "prefix": "vor-",
        "article": null,
        "pos": "verb",
        "translation": "to preview"
      },
      {
        "word": "wegschauen",
        "prefix": "weg-",
        "article": null,
        "pos": "verb",
        "translation": "to look away"
      }
    ],
    "suffixes": [
      {
        "word": "anschaulich",
        "suffix": "-lich",
        "article": null,
        "pos": "adjective",
        "translation": "illustrative"
      },
      {
        "word": "die Anschaulichkeit",
        "suffix": "-keit",
        "article": "die",
        "pos": "noun",
        "translation": "clarity"
      }
    ]
  },
  "ruf": {
    "root": "ruf",
    "base": "rufen",
    "wordFamily": [
      {
        "word": "der Ruf",
        "article": "der",
        "pos": "noun",
        "translation": "reputation, call, shout"
      },
      {
        "word": "der Anruf",
        "article": "der",
        "pos": "noun",
        "translation": "phone call"
      },
      {
        "word": "der Beruf",
        "article": "der",
        "pos": "noun",
        "translation": "profession, occupation"
      },
      {
        "word": "beruflich",
        "article": null,
        "pos": "adjective",
        "translation": "professional, vocational"
      }
    ],
    "prefixes": [
      {
        "word": "berufen",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to appoint, summon, appeal to (sich)"
      },
      {
        "word": "widerrufen",
        "prefix": "wider-",
        "article": null,
        "pos": "verb",
        "translation": "to revoke, retract, cancel"
      }
    ],
    "separableVerbs": [
      {
        "word": "anrufen",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to call on phone, appeal to"
      },
      {
        "word": "aufrufen",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to call up, invoke, appeal"
      },
      {
        "word": "abrufen",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to retrieve (data), recall"
      },
      {
        "word": "ausrufen",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to proclaim, call out"
      },
      {
        "word": "zurufen",
        "prefix": "zu-",
        "article": null,
        "pos": "verb",
        "translation": "to call out to someone"
      },
      {
        "word": "zurückrufen",
        "prefix": "zurück-",
        "article": null,
        "pos": "verb",
        "translation": "to call back, recall"
      },
      {
        "word": "wegrufen",
        "prefix": "weg-",
        "article": null,
        "pos": "verb",
        "translation": "to call away"
      }
    ],
    "suffixes": [
      {
        "word": "beruflich",
        "suffix": "-lich",
        "article": null,
        "pos": "adjective",
        "translation": "professional"
      },
      {
        "word": "die Berufung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "calling, appeal (legal)"
      }
    ]
  },
  "weis": {
    "root": "weis",
    "base": "weisen",
    "wordFamily": [
      {
        "word": "der Hinweis",
        "article": "der",
        "pos": "noun",
        "translation": "clue, tip, indication"
      },
      {
        "word": "der Beweis",
        "article": "der",
        "pos": "noun",
        "translation": "proof, evidence"
      },
      {
        "word": "der Ausweis",
        "article": "der",
        "pos": "noun",
        "translation": "ID card, badge"
      },
      {
        "word": "der Nachweis",
        "article": "der",
        "pos": "noun",
        "translation": "verification, record"
      },
      {
        "word": "weise",
        "article": null,
        "pos": "adjective",
        "translation": "wise, prudent"
      }
    ],
    "prefixes": [
      {
        "word": "beweisen",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to prove, demonstrate"
      },
      {
        "word": "verweisen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to refer to, banish, reprimand"
      },
      {
        "word": "erweisen",
        "prefix": "er-",
        "article": null,
        "pos": "verb",
        "translation": "to prove to be (sich), render"
      }
    ],
    "separableVerbs": [
      {
        "word": "hinweisen",
        "prefix": "hin-",
        "article": null,
        "pos": "verb",
        "translation": "to point out, refer to"
      },
      {
        "word": "nachweisen",
        "prefix": "nach-",
        "article": null,
        "pos": "verb",
        "translation": "to verify, prove, detect"
      },
      {
        "word": "anweisen",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to instruct, assign, wire (funds)"
      },
      {
        "word": "aufweisen",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to exhibit, show, feature"
      },
      {
        "word": "ausweisen",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to identify oneself, deport"
      },
      {
        "word": "abweisen",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to reject, dismiss, turn away"
      },
      {
        "word": "zuweisen",
        "prefix": "zu-",
        "article": null,
        "pos": "verb",
        "translation": "to allocate, assign, direct to"
      },
      {
        "word": "zurückweisen",
        "prefix": "zurück-",
        "article": null,
        "pos": "verb",
        "translation": "to rebuff, repudiate, decline"
      }
    ],
    "suffixes": [
      {
        "word": "weisbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "provable"
      },
      {
        "word": "die Zuweisung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "assignment"
      }
    ]
  },
  "sprech": {
    "root": "sprech",
    "base": "sprechen",
    "wordFamily": [
      {
        "word": "die Sprache",
        "article": "die",
        "pos": "noun",
        "translation": "language, speech"
      },
      {
        "word": "der Sprecher",
        "article": "der",
        "pos": "noun",
        "translation": "speaker, narrator, spokesperson"
      },
      {
        "word": "das Gespräch",
        "article": "das",
        "pos": "noun",
        "translation": "conversation, talk"
      },
      {
        "word": "der Anspruch",
        "article": "der",
        "pos": "noun",
        "translation": "claim, demand, expectation"
      },
      {
        "word": "der Widerspruch",
        "article": "der",
        "pos": "noun",
        "translation": "contradiction, objection"
      },
      {
        "word": "sprachlich",
        "article": null,
        "pos": "adjective",
        "translation": "linguistic"
      },
      {
        "word": "ansprechend",
        "article": null,
        "pos": "adjective",
        "translation": "appealing, pleasant"
      }
    ],
    "prefixes": [
      {
        "word": "besprechen",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to discuss, review"
      },
      {
        "word": "versprechen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to promise, misspeak (sich)"
      },
      {
        "word": "entsprechen",
        "prefix": "ent-",
        "article": null,
        "pos": "verb",
        "translation": "to correspond to, fulfill"
      },
      {
        "word": "widersprechen",
        "prefix": "wider-",
        "article": null,
        "pos": "verb",
        "translation": "to contradict, object"
      }
    ],
    "separableVerbs": [
      {
        "word": "ansprechen",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to address, appeal to, bring up"
      },
      {
        "word": "aussprechen",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to pronounce, express, finish speaking"
      },
      {
        "word": "absprechen",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to agree on, deny someone something"
      },
      {
        "word": "durchsprechen",
        "prefix": "durch-",
        "article": null,
        "pos": "verb",
        "translation": "to talk through, discuss in detail"
      },
      {
        "word": "freisprechen",
        "prefix": "frei-",
        "article": null,
        "pos": "verb",
        "translation": "to acquit, exonerate"
      },
      {
        "word": "mitsprechen",
        "prefix": "mit-",
        "article": null,
        "pos": "verb",
        "translation": "to have a say, join conversation"
      },
      {
        "word": "nachsprechen",
        "prefix": "nach-",
        "article": null,
        "pos": "verb",
        "translation": "to repeat after someone"
      },
      {
        "word": "vorsprechen",
        "prefix": "vor-",
        "article": null,
        "pos": "verb",
        "translation": "to audition, say for others to repeat"
      },
      {
        "word": "zusprechen",
        "prefix": "zu-",
        "article": null,
        "pos": "verb",
        "translation": "to award, encourage, attribute"
      }
    ],
    "suffixes": [
      {
        "word": "sprachlich",
        "suffix": "-lich",
        "article": null,
        "pos": "adjective",
        "translation": "linguistic"
      },
      {
        "word": "sprechbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "pronounceable"
      }
    ]
  },
  "bind": {
    "root": "bind",
    "base": "binden",
    "wordFamily": [
      {
        "word": "das Band",
        "article": "das",
        "pos": "noun",
        "translation": "ribbon, bond, tape"
      },
      {
        "word": "die Bindung",
        "article": "die",
        "pos": "noun",
        "translation": "binding, attachment, bond"
      },
      {
        "word": "die Verbindung",
        "article": "die",
        "pos": "noun",
        "translation": "connection, link, compound"
      },
      {
        "word": "verbindlich",
        "article": null,
        "pos": "adjective",
        "translation": "binding, mandatory, polite"
      }
    ],
    "prefixes": [
      {
        "word": "verbinden",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to connect, bandage, combine"
      },
      {
        "word": "entbinden",
        "prefix": "ent-",
        "article": null,
        "pos": "verb",
        "translation": "to deliver (baby), release from duty"
      },
      {
        "word": "unterbinden",
        "prefix": "unter-",
        "article": null,
        "pos": "verb",
        "translation": "to stop, prevent, halt"
      }
    ],
    "separableVerbs": [
      {
        "word": "anbinden",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to tie up, connect to"
      },
      {
        "word": "einbinden",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to integrate, bind into"
      },
      {
        "word": "abbinden",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to untie, tourniquet, cure (concrete)"
      },
      {
        "word": "aufbinden",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to untie, deceive someone (tale)"
      },
      {
        "word": "zubinden",
        "prefix": "zu-",
        "article": null,
        "pos": "verb",
        "translation": "to tie shut"
      },
      {
        "word": "zusammenbinden",
        "prefix": "zusammen-",
        "article": null,
        "pos": "verb",
        "translation": "to tie together"
      }
    ],
    "suffixes": [
      {
        "word": "die Verbindung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "connection"
      },
      {
        "word": "verbindlich",
        "suffix": "-lich",
        "article": null,
        "pos": "adjective",
        "translation": "binding"
      }
    ]
  },
  "fall": {
    "root": "fall",
    "base": "fallen",
    "wordFamily": [
      {
        "word": "der Fall",
        "article": "der",
        "pos": "noun",
        "translation": "case, fall, drop"
      },
      {
        "word": "der Unfall",
        "article": "der",
        "pos": "noun",
        "translation": "accident, crash"
      },
      {
        "word": "der Vorfall",
        "article": "der",
        "pos": "noun",
        "translation": "incident, event"
      },
      {
        "word": "der Einfall",
        "article": "der",
        "pos": "noun",
        "translation": "brainwave, idea, invasion"
      },
      {
        "word": "fällig",
        "article": null,
        "pos": "adjective",
        "translation": "due, payable"
      },
      {
        "word": "auffällig",
        "article": null,
        "pos": "adjective",
        "translation": "conspicuous, noticeable"
      }
    ],
    "prefixes": [
      {
        "word": "befallen",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to infest, afflict"
      },
      {
        "word": "verfallen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to decay, expire, succumb to"
      },
      {
        "word": "gefallen",
        "prefix": "ge-",
        "article": null,
        "pos": "verb",
        "translation": "to please, like"
      },
      {
        "word": "zerfallen",
        "prefix": "zer-",
        "article": null,
        "pos": "verb",
        "translation": "to disintegrate, decompose"
      }
    ],
    "separableVerbs": [
      {
        "word": "auffallen",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to attract attention, stand out"
      },
      {
        "word": "ausfallen",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to be cancelled, fail, turn out"
      },
      {
        "word": "einfallen",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to occur to someone, collapse, invade"
      },
      {
        "word": "abfallen",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to drop off, slope, decline"
      },
      {
        "word": "anfallen",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to attack, accumulate (costs)"
      },
      {
        "word": "durchfallen",
        "prefix": "durch-",
        "article": null,
        "pos": "verb",
        "translation": "to fail (exam), fall through"
      },
      {
        "word": "umfallen",
        "prefix": "um-",
        "article": null,
        "pos": "verb",
        "translation": "to fall over, faint, buckle"
      },
      {
        "word": "vorfallen",
        "prefix": "vor-",
        "article": null,
        "pos": "verb",
        "translation": "to happen, occur"
      },
      {
        "word": "wegfallen",
        "prefix": "weg-",
        "article": null,
        "pos": "verb",
        "translation": "to cease to apply, be omitted"
      },
      {
        "word": "zurückfallen",
        "prefix": "zurück-",
        "article": null,
        "pos": "verb",
        "translation": "to fall behind, regress"
      }
    ],
    "suffixes": [
      {
        "word": "fällig",
        "suffix": "-ig",
        "article": null,
        "pos": "adjective",
        "translation": "due"
      },
      {
        "word": "die Fälligkeit",
        "suffix": "-keit",
        "article": "die",
        "pos": "noun",
        "translation": "due date"
      }
    ]
  },
  "greif": {
    "root": "greif",
    "base": "greifen",
    "wordFamily": [
      {
        "word": "der Griff",
        "article": "der",
        "pos": "noun",
        "translation": "grip, handle, move"
      },
      {
        "word": "der Begriff",
        "article": "der",
        "pos": "noun",
        "translation": "concept, term, notion"
      },
      {
        "word": "der Angriff",
        "article": "der",
        "pos": "noun",
        "translation": "attack, offensive"
      },
      {
        "word": "der Eingriff",
        "article": "der",
        "pos": "noun",
        "translation": "intervention, surgery"
      },
      {
        "word": "greifbar",
        "article": null,
        "pos": "adjective",
        "translation": "tangible, accessible"
      },
      {
        "word": "begreiflich",
        "article": null,
        "pos": "adjective",
        "translation": "comprehensible"
      }
    ],
    "prefixes": [
      {
        "word": "begreifen",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to understand, grasp"
      },
      {
        "word": "ergreifen",
        "prefix": "er-",
        "article": null,
        "pos": "verb",
        "translation": "to seize (opportunity), touch emotionally"
      },
      {
        "word": "vergreifen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to assault, make a mistake (sich)"
      }
    ],
    "separableVerbs": [
      {
        "word": "angreifen",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to attack, affect"
      },
      {
        "word": "eingreifen",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to intervene, step in"
      },
      {
        "word": "aufgreifen",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to take up (topic), pick up (lead)"
      },
      {
        "word": "abgreifen",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to tap, skim off, grab"
      },
      {
        "word": "durchgreifen",
        "prefix": "durch-",
        "article": null,
        "pos": "verb",
        "translation": "to crack down, take drastic steps"
      },
      {
        "word": "vorgreifen",
        "prefix": "vor-",
        "article": null,
        "pos": "verb",
        "translation": "to anticipate, jump ahead"
      },
      {
        "word": "zugreifen",
        "prefix": "zu-",
        "article": null,
        "pos": "verb",
        "translation": "to grab, help oneself, seize"
      },
      {
        "word": "zurückgreifen",
        "prefix": "zurück-",
        "article": null,
        "pos": "verb",
        "translation": "to fall back on, resort to"
      }
    ],
    "suffixes": [
      {
        "word": "greifbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "tangible"
      },
      {
        "word": "die Greifbarkeit",
        "suffix": "-keit",
        "article": "die",
        "pos": "noun",
        "translation": "tangibility"
      }
    ]
  },
  "werf": {
    "root": "werf",
    "base": "werfen",
    "wordFamily": [
      {
        "word": "der Wurf",
        "article": "der",
        "pos": "noun",
        "translation": "throw, cast, litter (animals)"
      },
      {
        "word": "der Entwurf",
        "article": "der",
        "pos": "noun",
        "translation": "draft, design, outline"
      },
      {
        "word": "der Vorwurf",
        "article": "der",
        "pos": "noun",
        "translation": "reproach, accusation"
      },
      {
        "word": "vorwurfsvoll",
        "article": null,
        "pos": "adjective",
        "translation": "reproachful"
      }
    ],
    "prefixes": [
      {
        "word": "entwerfen",
        "prefix": "ent-",
        "article": null,
        "pos": "verb",
        "translation": "to design, draft, sketch"
      },
      {
        "word": "verwerfen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to discard, dismiss, reject"
      },
      {
        "word": "bewerfen",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to pelt with"
      }
    ],
    "separableVerbs": [
      {
        "word": "vorwerfen",
        "prefix": "vor-",
        "article": null,
        "pos": "verb",
        "translation": "to accuse, reproach"
      },
      {
        "word": "einwerfen",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to drop in (letter/coin), interject"
      },
      {
        "word": "aufwerfen",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to raise (question), throw open"
      },
      {
        "word": "abwerfen",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to drop, yield (profit)"
      },
      {
        "word": "anwerfen",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to start up (engine)"
      },
      {
        "word": "auswerfen",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to eject, cast (anchor)"
      },
      {
        "word": "hinwerfen",
        "prefix": "hin-",
        "article": null,
        "pos": "verb",
        "translation": "to throw down, give up"
      },
      {
        "word": "umwerfen",
        "prefix": "um-",
        "article": null,
        "pos": "verb",
        "translation": "to knock over, overturn"
      },
      {
        "word": "wegwerfen",
        "prefix": "weg-",
        "article": null,
        "pos": "verb",
        "translation": "to throw away, discard"
      },
      {
        "word": "zurückwerfen",
        "prefix": "zurück-",
        "article": null,
        "pos": "verb",
        "translation": "to throw back, set back"
      }
    ],
    "suffixes": [
      {
        "word": "werfbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "throwable"
      }
    ]
  },
  "häng": {
    "root": "häng",
    "base": "hängen",
    "wordFamily": [
      {
        "word": "der Hang",
        "article": "der",
        "pos": "noun",
        "translation": "slope, inclination, propensity"
      },
      {
        "word": "der Zusammenhang",
        "article": "der",
        "pos": "noun",
        "translation": "context, connection, coherence"
      },
      {
        "word": "der Anhang",
        "article": "der",
        "pos": "noun",
        "translation": "appendix, email attachment"
      },
      {
        "word": "abhängig",
        "article": null,
        "pos": "adjective",
        "translation": "dependent, addicted"
      },
      {
        "word": "unabhängig",
        "article": null,
        "pos": "adjective",
        "translation": "independent"
      }
    ],
    "prefixes": [
      {
        "word": "behängen",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to drape, festoon"
      },
      {
        "word": "verhängen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to impose (fine/curfew), drape"
      }
    ],
    "separableVerbs": [
      {
        "word": "abhängen",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to depend on, take down"
      },
      {
        "word": "anhängen",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to attach, append"
      },
      {
        "word": "aufhängen",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to hang up, suspend"
      },
      {
        "word": "aushängen",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to unhinge, post (notice)"
      },
      {
        "word": "einhängen",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to hang up (receiver), hook in"
      },
      {
        "word": "nachhängen",
        "prefix": "nach-",
        "article": null,
        "pos": "verb",
        "translation": "to dwell upon (memories)"
      },
      {
        "word": "zusammenhängen",
        "prefix": "zusammen-",
        "article": null,
        "pos": "verb",
        "translation": "to be connected, interrelate"
      }
    ],
    "suffixes": [
      {
        "word": "abhängig",
        "suffix": "-ig",
        "article": null,
        "pos": "adjective",
        "translation": "dependent"
      },
      {
        "word": "die Abhängigkeit",
        "suffix": "-keit",
        "article": "die",
        "pos": "noun",
        "translation": "dependency"
      }
    ]
  },
  "pack": {
    "root": "pack",
    "base": "packen",
    "wordFamily": [
      {
        "word": "das Paket",
        "article": "das",
        "pos": "noun",
        "translation": "parcel, package"
      },
      {
        "word": "die Verpackung",
        "article": "die",
        "pos": "noun",
        "translation": "packaging, wrapping"
      },
      {
        "word": "der Rucksack",
        "article": "der",
        "pos": "noun",
        "translation": "backpack"
      }
    ],
    "prefixes": [
      {
        "word": "verpacken",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to pack up, package"
      },
      {
        "word": "bepacken",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to load, burden with"
      }
    ],
    "separableVerbs": [
      {
        "word": "auspacken",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to unpack, reveal all"
      },
      {
        "word": "einpacken",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to pack, wrap, put away"
      },
      {
        "word": "abpacken",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to portion and pack"
      },
      {
        "word": "anpacken",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to tackle (problem), pitch in"
      },
      {
        "word": "aufpacken",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to load onto"
      },
      {
        "word": "wegpacken",
        "prefix": "weg-",
        "article": null,
        "pos": "verb",
        "translation": "to pack away"
      },
      {
        "word": "zupacken",
        "prefix": "zu-",
        "article": null,
        "pos": "verb",
        "translation": "to grip firmly, lend a hand"
      }
    ],
    "suffixes": [
      {
        "word": "die Verpackung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "packaging"
      },
      {
        "word": "packbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "packable"
      }
    ]
  },
  "lad": {
    "root": "lad",
    "base": "laden",
    "wordFamily": [
      {
        "word": "die Ladung",
        "article": "die",
        "pos": "noun",
        "translation": "cargo, charge, load"
      },
      {
        "word": "das Ladegerät",
        "article": "das",
        "pos": "noun",
        "translation": "charger"
      },
      {
        "word": "die Einladung",
        "article": "die",
        "pos": "noun",
        "translation": "invitation"
      },
      {
        "word": "der Laden",
        "article": "der",
        "pos": "noun",
        "translation": "shop, store"
      }
    ],
    "prefixes": [
      {
        "word": "beladen",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to load, burden"
      },
      {
        "word": "entladen",
        "prefix": "ent-",
        "article": null,
        "pos": "verb",
        "translation": "to unload, discharge"
      },
      {
        "word": "verladen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to load onto freight, ship"
      }
    ],
    "separableVerbs": [
      {
        "word": "einladen",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to invite, load in"
      },
      {
        "word": "herunterladen",
        "prefix": "herunter-",
        "article": null,
        "pos": "verb",
        "translation": "to download"
      },
      {
        "word": "hochladen",
        "prefix": "hoch-",
        "article": null,
        "pos": "verb",
        "translation": "to upload"
      },
      {
        "word": "aufladen",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to charge (battery), load onto"
      },
      {
        "word": "ausladen",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to unload, disinvite"
      },
      {
        "word": "abladen",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to dump, unload"
      },
      {
        "word": "nachladen",
        "prefix": "nach-",
        "article": null,
        "pos": "verb",
        "translation": "to reload, top up"
      }
    ],
    "suffixes": [
      {
        "word": "die Einladung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "invitation"
      },
      {
        "word": "ladbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "chargeable, loadable"
      }
    ]
  },
  "schick": {
    "root": "schick",
    "base": "schicken",
    "wordFamily": [
      {
        "word": "das Schicksal",
        "article": "das",
        "pos": "noun",
        "translation": "fate, destiny"
      },
      {
        "word": "die Schickung",
        "article": "die",
        "pos": "noun",
        "translation": "dispensation of fate"
      },
      {
        "word": "schicklich",
        "article": null,
        "pos": "adjective",
        "translation": "decent, proper"
      }
    ],
    "prefixes": [
      {
        "word": "beschicken",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to supply, attend (trade fair)"
      }
    ],
    "separableVerbs": [
      {
        "word": "abschicken",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to send off, dispatch, post"
      },
      {
        "word": "einschicken",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to send in, submit"
      },
      {
        "word": "mitschicken",
        "prefix": "mit-",
        "article": null,
        "pos": "verb",
        "translation": "to enclose, send along"
      },
      {
        "word": "nachschicken",
        "prefix": "nach-",
        "article": null,
        "pos": "verb",
        "translation": "to forward, send on after"
      },
      {
        "word": "vorschicken",
        "prefix": "vor-",
        "article": null,
        "pos": "verb",
        "translation": "to send ahead"
      },
      {
        "word": "wegschicken",
        "prefix": "weg-",
        "article": null,
        "pos": "verb",
        "translation": "to send away, dismiss"
      },
      {
        "word": "zuschicken",
        "prefix": "zu-",
        "article": null,
        "pos": "verb",
        "translation": "to send to someone"
      },
      {
        "word": "zurückschicken",
        "prefix": "zurück-",
        "article": null,
        "pos": "verb",
        "translation": "to return, send back"
      }
    ],
    "suffixes": [
      {
        "word": "schickbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "sendable"
      }
    ]
  },
  "rechn": {
    "root": "rechn",
    "base": "rechnen",
    "wordFamily": [
      {
        "word": "die Rechnung",
        "article": "die",
        "pos": "noun",
        "translation": "bill, invoice, calculation"
      },
      {
        "word": "der Rechner",
        "article": "der",
        "pos": "noun",
        "translation": "computer, calculator"
      },
      {
        "word": "das Rechenzentrum",
        "article": "das",
        "pos": "noun",
        "translation": "data center"
      },
      {
        "word": "rechnerisch",
        "article": null,
        "pos": "adjective",
        "translation": "mathematical, analytical"
      }
    ],
    "prefixes": [
      {
        "word": "berechnen",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to calculate, charge, compute"
      },
      {
        "word": "verrechnen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to miscalculate, offset (sich)"
      }
    ],
    "separableVerbs": [
      {
        "word": "ausrechnen",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to calculate, work out, reckon"
      },
      {
        "word": "abrechnen",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to settle accounts, bill"
      },
      {
        "word": "anrechnen",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to credit towards, count against"
      },
      {
        "word": "aufrechnen",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to balance against, offset"
      },
      {
        "word": "einrechnen",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to include in calculations"
      },
      {
        "word": "nachrechnen",
        "prefix": "nach-",
        "article": null,
        "pos": "verb",
        "translation": "to check calculations, recalculate"
      },
      {
        "word": "zusammenrechnen",
        "prefix": "zusammen-",
        "article": null,
        "pos": "verb",
        "translation": "to add up, total"
      }
    ],
    "suffixes": [
      {
        "word": "die Berechnung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "calculation"
      },
      {
        "word": "rechenbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "computable"
      }
    ]
  },
  "blick": {
    "root": "blick",
    "base": "blicken",
    "wordFamily": [
      {
        "word": "der Blick",
        "article": "der",
        "pos": "noun",
        "translation": "look, gaze, glance, view"
      },
      {
        "word": "der Augenblick",
        "article": "der",
        "pos": "noun",
        "translation": "moment, instant"
      },
      {
        "word": "der Überblick",
        "article": "der",
        "pos": "noun",
        "translation": "overview, summary"
      },
      {
        "word": "der Einblick",
        "article": "der",
        "pos": "noun",
        "translation": "insight, glimpse"
      },
      {
        "word": "augenblicklich",
        "article": null,
        "pos": "adjective",
        "translation": "instantaneous, at present"
      }
    ],
    "prefixes": [
      {
        "word": "erblicken",
        "prefix": "er-",
        "article": null,
        "pos": "verb",
        "translation": "to catch sight of, behold"
      }
    ],
    "separableVerbs": [
      {
        "word": "anblicken",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to look at, gaze upon"
      },
      {
        "word": "aufblicken",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to look up (with respect)"
      },
      {
        "word": "ausblicken",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to look out, contemplate"
      },
      {
        "word": "durchblicken",
        "prefix": "durch-",
        "article": null,
        "pos": "verb",
        "translation": "to see through, understand how it works"
      },
      {
        "word": "einblicken",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to look into, gain insight"
      },
      {
        "word": "umblicken",
        "prefix": "um-",
        "article": null,
        "pos": "verb",
        "translation": "to look around (sich)"
      },
      {
        "word": "vorblicken",
        "prefix": "vor-",
        "article": null,
        "pos": "verb",
        "translation": "to look forward"
      },
      {
        "word": "wegblicken",
        "prefix": "weg-",
        "article": null,
        "pos": "verb",
        "translation": "to look away"
      },
      {
        "word": "zurückblicken",
        "prefix": "zurück-",
        "article": null,
        "pos": "verb",
        "translation": "to look back, reflect"
      }
    ],
    "suffixes": [
      {
        "word": "augenblicklich",
        "suffix": "-lich",
        "article": null,
        "pos": "adjective",
        "translation": "immediate"
      }
    ]
  },
  "wend": {
    "root": "wend",
    "base": "wenden",
    "wordFamily": [
      {
        "word": "die Wende",
        "article": "die",
        "pos": "noun",
        "translation": "turning point, reunification"
      },
      {
        "word": "die Anwendung",
        "article": "die",
        "pos": "noun",
        "translation": "application, software, use"
      },
      {
        "word": "der Aufwand",
        "article": "der",
        "pos": "noun",
        "translation": "effort, expenditure, expense"
      },
      {
        "word": "die Einwand",
        "article": "der",
        "pos": "noun",
        "translation": "objection"
      },
      {
        "word": "anwendbar",
        "article": null,
        "pos": "adjective",
        "translation": "applicable, usable"
      },
      {
        "word": "wendig",
        "article": null,
        "pos": "adjective",
        "translation": "agile, maneuverable"
      }
    ],
    "prefixes": [
      {
        "word": "verwenden",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to use, utilize, apply"
      },
      {
        "word": "entwenden",
        "prefix": "ent-",
        "article": null,
        "pos": "verb",
        "translation": "to steal, pilfer"
      }
    ],
    "separableVerbs": [
      {
        "word": "anwenden",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to apply, utilize, employ"
      },
      {
        "word": "abwenden",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to avert, turn away, fend off"
      },
      {
        "word": "aufwenden",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to expend, spend (effort)"
      },
      {
        "word": "einwenden",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to object, raise argument"
      },
      {
        "word": "hinwenden",
        "prefix": "hin-",
        "article": null,
        "pos": "verb",
        "translation": "to turn towards"
      },
      {
        "word": "umwenden",
        "prefix": "um-",
        "article": null,
        "pos": "verb",
        "translation": "to turn around/over"
      },
      {
        "word": "zuwenden",
        "prefix": "zu-",
        "article": null,
        "pos": "verb",
        "translation": "to turn towards, devote oneself to"
      },
      {
        "word": "zurückwenden",
        "prefix": "zurück-",
        "article": null,
        "pos": "verb",
        "translation": "to turn back"
      }
    ],
    "suffixes": [
      {
        "word": "die Anwendung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "application"
      },
      {
        "word": "anwendbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "applicable"
      },
      {
        "word": "die Anwendbarkeit",
        "suffix": "-keit",
        "article": "die",
        "pos": "noun",
        "translation": "applicability"
      }
    ]
  },
  "steig": {
    "root": "steig",
    "base": "steigen",
    "wordFamily": [
      {
        "word": "der Anstieg",
        "article": "der",
        "pos": "noun",
        "translation": "increase, rise, incline"
      },
      {
        "word": "der Ausstieg",
        "article": "der",
        "pos": "noun",
        "translation": "exit, opt-out"
      },
      {
        "word": "der Einstieg",
        "article": "der",
        "pos": "noun",
        "translation": "entry, beginning, boarding"
      },
      {
        "word": "die Steigerung",
        "article": "die",
        "pos": "noun",
        "translation": "increase, enhancement, comparison (grammar)"
      },
      {
        "word": "steigerbar",
        "article": null,
        "pos": "adjective",
        "translation": "upgradeable, increasable"
      }
    ],
    "prefixes": [
      {
        "word": "besteigen",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to climb, board, ascend"
      },
      {
        "word": "ersteigen",
        "prefix": "er-",
        "article": null,
        "pos": "verb",
        "translation": "to scale (mountain)"
      },
      {
        "word": "versteigen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to get carried away (sich)"
      }
    ],
    "separableVerbs": [
      {
        "word": "einsteigen",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to board, get in (train/car), enter market"
      },
      {
        "word": "aussteigen",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to get off, exit, drop out"
      },
      {
        "word": "umsteigen",
        "prefix": "um-",
        "article": null,
        "pos": "verb",
        "translation": "to transfer, change trains"
      },
      {
        "word": "aufsteigen",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to ascend, rise, get promoted"
      },
      {
        "word": "absteigen",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to descend, get off (bike), get relegated"
      },
      {
        "word": "ansteigen",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to rise, slope upwards"
      },
      {
        "word": "zusteigen",
        "prefix": "zu-",
        "article": null,
        "pos": "verb",
        "translation": "to board en route"
      }
    ],
    "suffixes": [
      {
        "word": "die Steigerung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "increase"
      },
      {
        "word": "steigerbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "improvable"
      }
    ]
  },
  "antwort": {
    "root": "antwort",
    "base": "antworten",
    "wordFamily": [
      {
        "word": "die Antwort",
        "article": "die",
        "pos": "noun",
        "translation": "answer, reply, response"
      },
      {
        "word": "die Verantwortung",
        "article": "die",
        "pos": "noun",
        "translation": "responsibility, accountability"
      },
      {
        "word": "verantwortlich",
        "article": null,
        "pos": "adjective",
        "translation": "responsible, accountable"
      },
      {
        "word": "verantwortungslos",
        "article": null,
        "pos": "adjective",
        "translation": "irresponsible"
      },
      {
        "word": "antwortsuchend",
        "article": null,
        "pos": "adjective",
        "translation": "seeking answers"
      }
    ],
    "prefixes": [
      {
        "word": "beantworten",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to answer, reply to (question/email)"
      },
      {
        "word": "verantworten",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to take responsibility for, justify"
      }
    ],
    "separableVerbs": [
      {
        "word": "mitantworten",
        "prefix": "mit-",
        "article": null,
        "pos": "verb",
        "translation": "to answer along, join in replying"
      },
      {
        "word": "rückantworten",
        "prefix": "rück-",
        "article": null,
        "pos": "verb",
        "translation": "to send a reply back, respond"
      }
    ],
    "suffixes": [
      {
        "word": "die Verantwortung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "responsibility"
      },
      {
        "word": "verantwortlich",
        "suffix": "-lich",
        "article": null,
        "pos": "adjective",
        "translation": "responsible"
      },
      {
        "word": "verantwortungslos",
        "suffix": "-los",
        "article": null,
        "pos": "adjective",
        "translation": "irresponsible"
      },
      {
        "word": "die Verantwortlichkeit",
        "suffix": "-keit",
        "article": "die",
        "pos": "noun",
        "translation": "accountability"
      }
    ]
  },
  "klär": {
    "root": "klär",
    "base": "klären",
    "wordFamily": [
      {
        "word": "die Klärung",
        "article": "die",
        "pos": "noun",
        "translation": "clarification, settlement"
      },
      {
        "word": "die Erklärung",
        "article": "die",
        "pos": "noun",
        "translation": "explanation, declaration"
      },
      {
        "word": "die Aufklärung",
        "article": "die",
        "pos": "noun",
        "translation": "enlightenment, reconnaissance, education"
      },
      {
        "word": "klar",
        "article": null,
        "pos": "adjective",
        "translation": "clear, plain, obvious"
      },
      {
        "word": "erklärbar",
        "article": null,
        "pos": "adjective",
        "translation": "explainable"
      },
      {
        "word": "unerklärlich",
        "article": null,
        "pos": "adjective",
        "translation": "inexplicable"
      }
    ],
    "prefixes": [
      {
        "word": "erklären",
        "prefix": "er-",
        "article": null,
        "pos": "verb",
        "translation": "to explain, declare, state"
      },
      {
        "word": "verklären",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to transfigure, glorify"
      }
    ],
    "separableVerbs": [
      {
        "word": "aufklären",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to clear up, investigate, enlighten"
      },
      {
        "word": "abklären",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to clarify, verify, check out"
      }
    ],
    "suffixes": [
      {
        "word": "die Erklärung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "explanation"
      },
      {
        "word": "erklärbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "explainable"
      },
      {
        "word": "die Klarheit",
        "suffix": "-heit",
        "article": "die",
        "pos": "noun",
        "translation": "clarity"
      }
    ]
  },
  "gründ": {
    "root": "gründ",
    "base": "gründen",
    "wordFamily": [
      {
        "word": "der Grund",
        "article": "der",
        "pos": "noun",
        "translation": "reason, ground, motive, bottom"
      },
      {
        "word": "die Gründung",
        "article": "die",
        "pos": "noun",
        "translation": "founding, establishment, creation"
      },
      {
        "word": "die Begründung",
        "article": "die",
        "pos": "noun",
        "translation": "justification, rationale, reasoning"
      },
      {
        "word": "der Gründer",
        "article": "der",
        "pos": "noun",
        "translation": "founder"
      },
      {
        "word": "gründlich",
        "article": null,
        "pos": "adjective",
        "translation": "thorough, rigorous"
      },
      {
        "word": "grundlegend",
        "article": null,
        "pos": "adjective",
        "translation": "fundamental, basic"
      }
    ],
    "prefixes": [
      {
        "word": "begründen",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to justify, substantiate, establish"
      },
      {
        "word": "ergründen",
        "prefix": "er-",
        "article": null,
        "pos": "verb",
        "translation": "to fathom, probe, investigate"
      }
    ],
    "separableVerbs": [
      {
        "word": "ausgründen",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to spin off (company), branch out"
      }
    ],
    "suffixes": [
      {
        "word": "die Begründung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "justification"
      },
      {
        "word": "gründlich",
        "suffix": "-lich",
        "article": null,
        "pos": "adjective",
        "translation": "thorough"
      },
      {
        "word": "die Gründlichkeit",
        "suffix": "-keit",
        "article": "die",
        "pos": "noun",
        "translation": "thoroughness"
      }
    ]
  },
  "scheid": {
    "root": "scheid",
    "base": "scheiden",
    "wordFamily": [
      {
        "word": "die Entscheidung",
        "article": "die",
        "pos": "noun",
        "translation": "decision, determination"
      },
      {
        "word": "der Unterschied",
        "article": "der",
        "pos": "noun",
        "translation": "difference, distinction"
      },
      {
        "word": "der Abschied",
        "article": "der",
        "pos": "noun",
        "translation": "farewell, departure, goodbye"
      },
      {
        "word": "entscheidend",
        "article": null,
        "pos": "adjective",
        "translation": "decisive, crucial"
      },
      {
        "word": "unterschiedlich",
        "article": null,
        "pos": "adjective",
        "translation": "different, varying"
      }
    ],
    "prefixes": [
      {
        "word": "entscheiden",
        "prefix": "ent-",
        "article": null,
        "pos": "verb",
        "translation": "to decide, determine"
      },
      {
        "word": "unterscheiden",
        "prefix": "unter-",
        "article": null,
        "pos": "verb",
        "translation": "to distinguish, differentiate"
      },
      {
        "word": "bescheiden",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to inform, grant / modest (adj)"
      }
    ],
    "separableVerbs": [
      {
        "word": "ausscheiden",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to drop out, be eliminated, secrete"
      },
      {
        "word": "abscheiden",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to separate, precipitate"
      }
    ],
    "suffixes": [
      {
        "word": "die Entscheidung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "decision"
      },
      {
        "word": "unterscheidbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "distinguishable"
      }
    ]
  },
  "gleich": {
    "root": "gleich",
    "base": "gleichen",
    "wordFamily": [
      {
        "word": "der Vergleich",
        "article": "der",
        "pos": "noun",
        "translation": "comparison, settlement"
      },
      {
        "word": "der Ausgleich",
        "article": "der",
        "pos": "noun",
        "translation": "compensation, balance, equalizer"
      },
      {
        "word": "das Gleichgewicht",
        "article": "das",
        "pos": "noun",
        "translation": "equilibrium, balance"
      },
      {
        "word": "gleich",
        "article": null,
        "pos": "adjective",
        "translation": "equal, same, identical"
      },
      {
        "word": "gleichzeitig",
        "article": null,
        "pos": "adjective",
        "translation": "simultaneous"
      },
      {
        "word": "vergleichbar",
        "article": null,
        "pos": "adjective",
        "translation": "comparable"
      }
    ],
    "prefixes": [
      {
        "word": "vergleichen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to compare, match"
      },
      {
        "word": "begleichen",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to settle (bill), pay off"
      }
    ],
    "separableVerbs": [
      {
        "word": "ausgleichen",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to balance, compensate, level"
      },
      {
        "word": "abgleichen",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to calibrate, synchronize, align"
      },
      {
        "word": "angleichen",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to adjust, assimilate, adapt"
      }
    ],
    "suffixes": [
      {
        "word": "vergleichbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "comparable"
      },
      {
        "word": "die Gleichheit",
        "suffix": "-heit",
        "article": "die",
        "pos": "noun",
        "translation": "equality"
      }
    ]
  },
  "leit": {
    "root": "leit",
    "base": "leiten",
    "wordFamily": [
      {
        "word": "die Leitung",
        "article": "die",
        "pos": "noun",
        "translation": "management, pipe, wire, leadership"
      },
      {
        "word": "der Leiter",
        "article": "der",
        "pos": "noun",
        "translation": "director, conductor, ladder"
      },
      {
        "word": "die Anleitung",
        "article": "die",
        "pos": "noun",
        "translation": "instructions, guide, manual"
      },
      {
        "word": "die Begleitung",
        "article": "die",
        "pos": "noun",
        "translation": "accompaniment, escort"
      },
      {
        "word": "leitend",
        "article": null,
        "pos": "adjective",
        "translation": "executive, managerial"
      }
    ],
    "prefixes": [
      {
        "word": "begleiten",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to accompany, escort"
      },
      {
        "word": "verleiten",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to entice, mislead"
      },
      {
        "word": "erleiten",
        "prefix": "er-",
        "article": null,
        "pos": "verb",
        "translation": "to suffer, endure"
      }
    ],
    "separableVerbs": [
      {
        "word": "anleiten",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to guide, instruct, coach"
      },
      {
        "word": "ableiten",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to derive, divert, deduce"
      },
      {
        "word": "weiterleiten",
        "prefix": "weiter-",
        "article": null,
        "pos": "verb",
        "translation": "to forward (email), redirect"
      },
      {
        "word": "umleiten",
        "prefix": "um-",
        "article": null,
        "pos": "verb",
        "translation": "to detour, reroute"
      },
      {
        "word": "einleiten",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to initiate, introduce, discharge into"
      },
      {
        "word": "zuleiten",
        "prefix": "zu-",
        "article": null,
        "pos": "verb",
        "translation": "to feed into, transmit"
      }
    ],
    "suffixes": [
      {
        "word": "die Anleitung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "instructions"
      },
      {
        "word": "leitfähig",
        "suffix": "-fähig",
        "article": null,
        "pos": "adjective",
        "translation": "conductive"
      }
    ]
  },
  "bild": {
    "root": "bild",
    "base": "bilden",
    "wordFamily": [
      {
        "word": "das Bild",
        "article": "das",
        "pos": "noun",
        "translation": "picture, image, screen"
      },
      {
        "word": "die Bildung",
        "article": "die",
        "pos": "noun",
        "translation": "education, formation"
      },
      {
        "word": "die Ausbildung",
        "article": "die",
        "pos": "noun",
        "translation": "vocational training, apprenticeship"
      },
      {
        "word": "die Weiterbildung",
        "article": "die",
        "pos": "noun",
        "translation": "continuing education, upskilling"
      },
      {
        "word": "das Vorbild",
        "article": "das",
        "pos": "noun",
        "translation": "role model, example"
      },
      {
        "word": "bildhaft",
        "article": null,
        "pos": "adjective",
        "translation": "pictorial, vivid"
      }
    ],
    "prefixes": [
      {
        "word": "gebildet",
        "prefix": "ge-",
        "article": null,
        "pos": "adjective",
        "translation": "educated, cultured"
      }
    ],
    "separableVerbs": [
      {
        "word": "ausbilden",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to train, educate, cultivate"
      },
      {
        "word": "weiterbilden",
        "prefix": "weiter-",
        "article": null,
        "pos": "verb",
        "translation": "to pursue continuing education"
      },
      {
        "word": "abbilden",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to depict, portray, mirror"
      },
      {
        "word": "einbilden",
        "prefix": "ein-",
        "article": null,
        "pos": "verb",
        "translation": "to imagine, be conceited (sich)"
      },
      {
        "word": "umbilden",
        "prefix": "um-",
        "article": null,
        "pos": "verb",
        "translation": "to reorganize, reshape"
      }
    ],
    "suffixes": [
      {
        "word": "die Ausbildung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "training"
      },
      {
        "word": "bildbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "moldable, educable"
      }
    ]
  },
  "nutz": {
    "root": "nutz",
    "base": "nutzen",
    "wordFamily": [
      {
        "word": "der Nutzen",
        "article": "der",
        "pos": "noun",
        "translation": "benefit, utility, advantage"
      },
      {
        "word": "die Nutzung",
        "article": "die",
        "pos": "noun",
        "translation": "usage, utilization"
      },
      {
        "word": "der Benutzer",
        "article": "der",
        "pos": "noun",
        "translation": "user"
      },
      {
        "word": "nützlich",
        "article": null,
        "pos": "adjective",
        "translation": "useful, helpful"
      },
      {
        "word": "nutzlos",
        "article": null,
        "pos": "adjective",
        "translation": "useless, futile"
      }
    ],
    "prefixes": [
      {
        "word": "benutzen",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to use, utilize, employ"
      },
      {
        "word": "vernutzen",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to wear out through use"
      }
    ],
    "separableVerbs": [
      {
        "word": "ausnutzen",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to exploit, take advantage of, make full use of"
      },
      {
        "word": "abnutzen",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to wear down, scuff"
      }
    ],
    "suffixes": [
      {
        "word": "nützlich",
        "suffix": "-lich",
        "article": null,
        "pos": "adjective",
        "translation": "useful"
      },
      {
        "word": "nutzlos",
        "suffix": "-los",
        "article": null,
        "pos": "adjective",
        "translation": "useless"
      },
      {
        "word": "die Nützlichkeit",
        "suffix": "-keit",
        "article": "die",
        "pos": "noun",
        "translation": "usefulness"
      }
    ]
  },
  "wart": {
    "root": "wart",
    "base": "warten",
    "wordFamily": [
      {
        "word": "die Wartung",
        "article": "die",
        "pos": "noun",
        "translation": "maintenance, servicing"
      },
      {
        "word": "die Erwartung",
        "article": "die",
        "pos": "noun",
        "translation": "expectation, anticipation"
      },
      {
        "word": "das Wartezimmer",
        "article": "das",
        "pos": "noun",
        "translation": "waiting room"
      },
      {
        "word": "unerwartet",
        "article": null,
        "pos": "adjective",
        "translation": "unexpected"
      }
    ],
    "prefixes": [
      {
        "word": "erwarten",
        "prefix": "er-",
        "article": null,
        "pos": "verb",
        "translation": "to expect, await, anticipate"
      }
    ],
    "separableVerbs": [
      {
        "word": "abwarten",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to wait and see, wait out"
      },
      {
        "word": "aufwarten",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to present, serve up (surprises)"
      }
    ],
    "suffixes": [
      {
        "word": "die Erwartung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "expectation"
      },
      {
        "word": "wartbar",
        "suffix": "-bar",
        "article": null,
        "pos": "adjective",
        "translation": "maintainable"
      }
    ]
  },
  "besser": {
    "root": "besser",
    "base": "bessern",
    "wordFamily": [
      {
        "word": "die Besserung",
        "article": "die",
        "pos": "noun",
        "translation": "improvement, recovery (Gute Besserung!)"
      },
      {
        "word": "die Verbesserung",
        "article": "die",
        "pos": "noun",
        "translation": "enhancement, correction"
      },
      {
        "word": "besser",
        "article": null,
        "pos": "adjective",
        "translation": "better"
      }
    ],
    "prefixes": [
      {
        "word": "verbessern",
        "prefix": "ver-",
        "article": null,
        "pos": "verb",
        "translation": "to improve, enhance, correct"
      }
    ],
    "separableVerbs": [
      {
        "word": "ausbessern",
        "prefix": "aus-",
        "article": null,
        "pos": "verb",
        "translation": "to touch up, repair, mend"
      }
    ],
    "suffixes": [
      {
        "word": "die Verbesserung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "improvement"
      }
    ]
  },
  "forder": {
    "root": "forder",
    "base": "fordern",
    "wordFamily": [
      {
        "word": "die Forderung",
        "article": "die",
        "pos": "noun",
        "translation": "demand, claim, requirement"
      },
      {
        "word": "die Anforderung",
        "article": "die",
        "pos": "noun",
        "translation": "requirement, prerequisite, specification"
      },
      {
        "word": "die Herausforderung",
        "article": "die",
        "pos": "noun",
        "translation": "challenge"
      },
      {
        "word": "fordernd",
        "article": null,
        "pos": "adjective",
        "translation": "demanding, exacting"
      }
    ],
    "prefixes": [
      {
        "word": "erfordern",
        "prefix": "er-",
        "article": null,
        "pos": "verb",
        "translation": "to require, necessitate, demand"
      }
    ],
    "separableVerbs": [
      {
        "word": "auffordern",
        "prefix": "auf-",
        "article": null,
        "pos": "verb",
        "translation": "to prompt, urge, invite to dance"
      },
      {
        "word": "anfordern",
        "prefix": "an-",
        "article": null,
        "pos": "verb",
        "translation": "to request, requisition, order"
      },
      {
        "word": "herausfordern",
        "prefix": "heraus-",
        "article": null,
        "pos": "verb",
        "translation": "to challenge, provoke"
      },
      {
        "word": "abfordern",
        "prefix": "ab-",
        "article": null,
        "pos": "verb",
        "translation": "to demand from someone"
      }
    ],
    "suffixes": [
      {
        "word": "die Anforderung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "requirement"
      }
    ]
  },
  "förder": {
    "root": "förder",
    "base": "fördern",
    "wordFamily": [
      {
        "word": "die Förderung",
        "article": "die",
        "pos": "noun",
        "translation": "funding, promotion, extraction (mining)"
      },
      {
        "word": "die Beförderung",
        "article": "die",
        "pos": "noun",
        "translation": "promotion, transport, carriage"
      },
      {
        "word": "der Förderer",
        "article": "der",
        "pos": "noun",
        "translation": "sponsor, patron"
      },
      {
        "word": "förderlich",
        "article": null,
        "pos": "adjective",
        "translation": "conducive, helpful"
      }
    ],
    "prefixes": [
      {
        "word": "befördern",
        "prefix": "be-",
        "article": null,
        "pos": "verb",
        "translation": "to promote, transport, convey"
      }
    ],
    "separableVerbs": [
      {
        "word": "herauffördern",
        "prefix": "herauf-",
        "article": null,
        "pos": "verb",
        "translation": "to bring up, extract"
      },
      {
        "word": "zutagefördern",
        "prefix": "zutage-",
        "article": null,
        "pos": "verb",
        "translation": "to unearth, bring to light"
      }
    ],
    "suffixes": [
      {
        "word": "die Förderung",
        "suffix": "-ung",
        "article": "die",
        "pos": "noun",
        "translation": "promotion"
      },
      {
        "word": "förderlich",
        "suffix": "-lich",
        "article": null,
        "pos": "adjective",
        "translation": "beneficial"
      }
    ]
  }
};

    static getStem(rawWord) {
    if (!rawWord) return '';
    let w = rawWord.trim().toLowerCase();
    
    // Remove article if attached (e.g. "die Antwort" -> "Antwort")
    w = w.replace(/^(der|die|das|dem|den|des|ein|eine|einen|einem|einer|eines)\s+/, '');

    const IRREGULAR_MAPPINGS = {
      'ging': 'geh', 'gingen': 'geh', 'gegangen': 'geh',
      'stand': 'steh', 'standen': 'steh', 'gestanden': 'steh',
      'sprach': 'sprech', 'sprachen': 'sprech', 'gesprochen': 'sprech',
      'fuhr': 'fahr', 'fuhren': 'fahr', 'gefahren': 'fahr',
      'sah': 'seh', 'sahen': 'seh', 'gesehen': 'seh',
      'schrieb': 'schreib', 'schrieben': 'schreib', 'geschrieben': 'schreib',
      'nahm': 'nehm', 'nahmen': 'nehm', 'genommen': 'nehm',
      'gab': 'geb', 'gaben': 'geb', 'gegeben': 'geb',
      'fand': 'find', 'fanden': 'find', 'gefunden': 'find',
      'kam': 'komm', 'kamen': 'komm', 'gekommen': 'komm',
      'lief': 'lauf', 'liefen': 'lauf', 'gelaufen': 'lauf',
      'schnitt': 'schneid', 'schnitten': 'schneid', 'geschnitten': 'schneid',
      'fiel': 'fall', 'fielen': 'fall', 'gefallen': 'fall',
      'zog': 'zieh', 'zogen': 'zieh', 'gezogen': 'zieh',
      'trug': 'trag', 'trugen': 'trag', 'getragen': 'trag',
      'brachte': 'bring', 'brachten': 'bring', 'gebracht': 'bring',
      'dachte': 'denk', 'dachten': 'denk', 'gedacht': 'denk',
      'hielt': 'halt', 'hielten': 'halt', 'gehalten': 'halt',
      'blieb': 'bleib', 'blieben': 'bleib', 'geblieben': 'bleib',
      'ließ': 'lass', 'liessen': 'lass', 'gelassen': 'lass'
    };

    if (IRREGULAR_MAPPINGS[w]) return IRREGULAR_MAPPINGS[w];
    if (this.ROOT_FAMILIES[w]) return w;

    // 1. Strip Separable Prefixes (Sorted by length descending)
    let stripped = w;
    for (const p of this.SEPARABLE_PREFIXES) {
      if (stripped.startsWith(p) && stripped.length - p.length >= 3) {
        stripped = stripped.slice(p.length);
        break;
      }
    }

    if (IRREGULAR_MAPPINGS[stripped]) return IRREGULAR_MAPPINGS[stripped];
    if (this.ROOT_FAMILIES[stripped]) return stripped;

    // 2. Multi-letter suffix stripping - Prioritize direct infinitive -en, -eln, -ern before conjugated -tet/-ten
    const endings = [
      'ungen', 'ung', 'heiten', 'heit', 'keiten', 'keit', 'schaften', 'schaft',
      'lichen', 'licher', 'liches', 'liche', 'lich', 'bar', 'los', 'sam', 'voll',
      'end', 'ende', 'enden', 'eln', 'ern', 'en', 'tet', 'test', 'ten', 'te', 'st',
      'er', 'es', 'em', 'e'
    ];
    
    let candidate = stripped;
    for (const end of endings) {
      if (candidate.endsWith(end) && candidate.length - end.length >= 2) {
        candidate = candidate.slice(0, -end.length);
        break;
      }
    }

    if (this.ROOT_FAMILIES[candidate]) return candidate;

    // 3. Inseparable prefixes (be-, ver-, er-, ent-, zer-, ge-, miss-, emp-)
    const PROTECTED_ROOTS = ['geh', 'geb', 'gelt', 'gescheh', 'gerat', 'genes', 'gedey', 'gehorch', 'bleib', 'bring'];
    let afterInsep = stripped;
    for (const p of this.INSEPARABLE_PREFIXES) {
      if (p === 'ge' && PROTECTED_ROOTS.some(r => stripped.startsWith(r))) {
        continue;
      }
      if (p === 'be' && (stripped.startsWith('bett') || stripped.startsWith('bess') || stripped.startsWith('berg'))) {
        continue;
      }
      if (afterInsep.startsWith(p) && afterInsep.length - p.length >= 3) {
        afterInsep = afterInsep.slice(p.length);
        break;
      }
    }

    if (this.ROOT_FAMILIES[afterInsep]) return afterInsep;

    let candidateInsep = afterInsep;
    for (const end of endings) {
      if (candidateInsep.endsWith(end) && candidateInsep.length - end.length >= 2) {
        candidateInsep = candidateInsep.slice(0, -end.length);
        break;
      }
    }

    if (this.ROOT_FAMILIES[candidateInsep]) return candidateInsep;

    // Direct root lookup
    for (const rootKey of Object.keys(this.ROOT_FAMILIES)) {
      if (candidateInsep === rootKey || candidate === rootKey || afterInsep === rootKey || stripped === rootKey) return rootKey;
    }

    // 4. Smart Umlaut-Mutation Normalization (ä->a, ö->o, ü->u, ß->ss)
    const normalizeUmlaut = (s) => s.replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss');
    const normCandidate = normalizeUmlaut(candidateInsep || candidate || afterInsep);
    
    for (const rootKey of Object.keys(this.ROOT_FAMILIES)) {
      if (normCandidate === normalizeUmlaut(rootKey)) return rootKey;
    }

    for (const rootKey of Object.keys(this.ROOT_FAMILIES)) {
      if (afterInsep.includes(rootKey) || stripped.includes(rootKey) || candidateInsep.includes(rootKey)) return rootKey;
      if (normCandidate.includes(normalizeUmlaut(rootKey))) return rootKey;
    }

    return candidateInsep || candidate || afterInsep || stripped;
  }

  static _morphCache = new Map();

  static getMorphology(rawWord) {
    if (!rawWord || rawWord.trim().length < 2) {
      return null;
    }

    const clean = rawWord.trim();
    if (this._morphCache.has(clean)) {
      return this._morphCache.get(clean);
    }

    const stem = this.getStem(clean);
    
    // 1. Direct Curated Root Family
    if (this.ROOT_FAMILIES[stem]) {
      this._morphCache.set(clean, this.ROOT_FAMILIES[stem]);
      return this.ROOT_FAMILIES[stem];
    }

    // Search if any curated root contains or matches
    for (const key of Object.keys(this.ROOT_FAMILIES)) {
      if (stem.includes(key) || key.includes(stem)) {
        this._morphCache.set(clean, this.ROOT_FAMILIES[key]);
        return this.ROOT_FAMILIES[key];
      }
    }

    // 2. Dynamic Construction against Dictionary
    const result = this.generateDynamicMorphology(clean, stem);
    if (result) {
      this._morphCache.set(clean, result);
    }
    return result;
  }

    static generateDynamicMorphology(rawWord, stem) {
    if (!stem || stem.length < 3) return null;

    const dict = window.GERMAN_DICTIONARY || {};
    const wordFamily = [];
    const prefixes = [];
    const separableVerbs = [];
    const suffixes = [];
    const seenWords = new Set();

    const addWord = (targetArray, item) => {
      const key = item.word.toLowerCase();
      if (!seenWords.has(key)) {
        seenWords.add(key);
        targetArray.push(item);
      }
    };

    // 1. Scan dictionary for words with this stem
    const entries = Object.keys(dict);
    for (const wordKey of entries) {
      const lower = wordKey.toLowerCase();
      if (!lower.includes(stem)) continue;

      const def = dict[wordKey];
      const analysis = GermanGrammarEngine.analyze(wordKey, def);
      const article = def.gender ? def.gender.split(' ')[0] : analysis.gender;
      const pos = def.pos || analysis.pos;
      const trans = def.en || '';

      const item = {
        word: article ? `${article} ${wordKey}` : wordKey,
        rawWord: wordKey,
        article: article || null,
        pos: pos,
        translation: trans
      };

      // Check Separable Verbs
      let isSeparable = false;
      for (const sep of this.SEPARABLE_PREFIXES) {
        if (lower.startsWith(sep) && (lower.endsWith('en') || lower.endsWith('n')) && lower.length - sep.length >= 3) {
          isSeparable = true;
          item.prefix = sep + '-';
          addWord(separableVerbs, item);
          break;
        }
      }

      if (isSeparable) continue;

      // Check Inseparable Prefixes
      let isInseparable = false;
      for (const insep of this.INSEPARABLE_PREFIXES) {
        if (lower.startsWith(insep) && (lower.endsWith('en') || isCapitalized(wordKey))) {
          isInseparable = true;
          item.prefix = insep + '-';
          addWord(prefixes, item);
          break;
        }
      }

      if (isInseparable) continue;

      // Check Suffixes
      for (const sufPattern of this.SUFFIX_PATTERNS) {
        if (lower.endsWith(sufPattern.suffix)) {
          item.suffix = '-' + sufPattern.suffix;
          addWord(suffixes, item);
          break;
        }
      }

      // Base Family
      addWord(wordFamily, item);
    }

    // 2. Fallback heuristic: If it is a verb ending in 'en' or 'eln', dynamically generate standard separable forms with known prefix meanings
    const cleanLower = rawWord.toLowerCase();
    const isVerb = cleanLower.endsWith('en') || cleanLower.endsWith('eln') || cleanLower.endsWith('ern');
    if (isVerb && separableVerbs.length === 0) {
      const baseInf = isVerb ? cleanLower : stem + 'en';
      const commonVerbPrefixes = [
        { prefix: 'ab', desc: 'off / down / away' },
        { prefix: 'an', desc: 'at / on / start' },
        { prefix: 'auf', desc: 'up / open' },
        { prefix: 'aus', desc: 'out / off / complete' },
        { prefix: 'ein', desc: 'in / into / initiate' },
        { prefix: 'mit', desc: 'along / with' },
        { prefix: 'vor', desc: 'forward / ahead' },
        { prefix: 'zu', desc: 'towards / closed / shut' },
        { prefix: 'zurück', desc: 'back / return' }
      ];

      for (const p of commonVerbPrefixes) {
        const sepVerb = p.prefix + baseInf;
        if (dict[sepVerb]) {
          addWord(separableVerbs, {
            word: sepVerb,
            prefix: p.prefix + '-',
            article: null,
            pos: 'verb',
            translation: dict[sepVerb].en || `to ${baseInf} (${p.desc})`
          });
        }
      }
    }

    if (wordFamily.length === 0 && prefixes.length === 0 && separableVerbs.length === 0 && suffixes.length === 0) {
      return null;
    }

    return {
      root: stem,
      base: rawWord,
      wordFamily: wordFamily.slice(0, 8),
      prefixes: prefixes.slice(0, 8),
      separableVerbs: separableVerbs.slice(0, 8),
      suffixes: suffixes.slice(0, 8)
    };
  }
}

function isCapitalized(str) {
  return str && str[0] === str[0].toUpperCase() && str[0] !== str[0].toLowerCase();
}

window.GermanGrammarEngine = GermanGrammarEngine;
window.GermanMorphologyEngine = GermanMorphologyEngine;
window.translator = new GermanTranslator();

