// Vocabulary & Study Hub Manager with Triple-Mode Obsidian Vault Auto-Sync & Anki TSV
class VocabularyManager {
  constructor() {
    this.vocabList = this.loadFromStorage();
    this.listeners = [];
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('german_reader_vocab');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('Storage read warning:', e);
      return [];
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem('german_reader_vocab', JSON.stringify(this.vocabList));
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to save vocabulary:', e);
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
  }

  notifyListeners() {
    this.listeners.forEach(fn => fn(this.vocabList));
  }

  getWords() {
    return this.vocabList || [];
  }

  addWord({ german, english, pageNum, pos, gender, example, annotationId }) {
    const cleanDe = (german || '').trim();
    const cleanEn = (english || '').trim();
    if (!cleanDe || !cleanEn) return null;

    const existingIndex = this.vocabList.findIndex(v => v.german.toLowerCase() === cleanDe.toLowerCase());
    if (existingIndex >= 0) {
      this.vocabList[existingIndex].count = (this.vocabList[existingIndex].count || 1) + 1;
      this.vocabList[existingIndex].lastSeen = new Date().toISOString();
      this.vocabList[existingIndex].pageNum = pageNum;
      if (gender && !this.vocabList[existingIndex].gender) {
        this.vocabList[existingIndex].gender = gender;
      }
      if (pos && !this.vocabList[existingIndex].pos) {
        this.vocabList[existingIndex].pos = pos;
      }
      this.saveToStorage();
      return this.vocabList[existingIndex];
    }

    const newEntry = {
      id: 'voc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      german: cleanDe,
      english: cleanEn,
      pageNum: pageNum || 1,
      pos: pos || 'word',
      gender: gender || null,
      example: example || null,
      annotationId: annotationId || null,
      addedAt: new Date().toISOString(),
      count: 1,
      mastered: false
    };

    this.vocabList.unshift(newEntry);
    this.saveToStorage();
    return newEntry;
  }

  removeWord(id) {
    this.vocabList = this.vocabList.filter(v => v.id !== id);
    this.saveToStorage();
  }

  removeByText(germanText) {
    this.vocabList = this.vocabList.filter(v => v.german.toLowerCase() !== (germanText || '').toLowerCase().trim());
    this.saveToStorage();
  }

  clear() {
    this.vocabList = [];
    this.saveToStorage();
  }

  // Generate Obsidian Markdown with Callouts, Tables & Anki Spaced Repetition Syntax
  generateObsidianMarkdown(podcastTitle = 'German Reading') {
    const today = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const title = (podcastTitle || 'German Reading').trim();

    let md = `\n## 🎙️ ${title}\n`;
    md += `> [!info] Reading & Podcast Metadata\n`;
    md += `> **Date**: ${today} | **Words Count**: ${this.vocabList.length} | **Tags**: #german #wortschatz #vocabulary #reading\n\n`;
    md += `| German | English Translation | Gender / Class | Page | Spaced Repetition (Anki) |\n`;
    md += `| :--- | :--- | :--- | :---: | :--- |\n`;

    this.vocabList.forEach(v => {
      const genderPos = v.gender ? `${v.gender} (${v.pos || 'noun'})` : (v.pos || 'word');
      const cleanDe = v.german.replace(/\|/g, '-');
      const cleanEn = v.english.replace(/\|/g, '-');
      md += `| **${cleanDe}** | ${cleanEn} | ${genderPos} | ${v.pageNum || 1} | \`${cleanDe} :: ${cleanEn}\` |\n`;
    });

    md += `\n### 🧠 Flashcard Study Deck\n`;
    this.vocabList.forEach(v => {
      const gPrefix = v.gender ? `${v.gender} ` : '';
      md += `- ${gPrefix}**${v.german}** :: ${v.english} [${v.pos || 'word'}]\n`;
    });

    md += `\n---\n`;
    return md;
  }

  // 1. Direct iPadOS Obsidian App URI Trigger (Native iPad Experience)
  openInObsidianApp(podcastTitle = 'German Reading', vaultName = '') {
    if (this.vocabList.length === 0) {
      alert('No vocabulary words to sync yet. Highlight some words in the PDF first!');
      return false;
    }

    const vName = (vaultName || localStorage.getItem('obsidian_vault_name') || 'Obsidian Vault').trim();
    const mdContent = this.generateObsidianMarkdown(podcastTitle);
    
    // First try Advanced URI mode append, fallback to native URI
    const encodedVault = encodeURIComponent(vName);
    const encodedData = encodeURIComponent(mdContent);
    const encodedFile = encodeURIComponent('vocabulary.md');

    // Obsidian Advanced URI format: obsidian://advanced-uri?vault=<vault>&filepath=vocabulary.md&data=<data>&mode=append
    const advancedUri = `obsidian://advanced-uri?vault=${encodedVault}&filepath=${encodedFile}&data=${encodedData}&mode=append`;

    // Standard Obsidian URI fallback: obsidian://new?vault=<vault>&file=vocabulary&content=<data>&append=true
    const standardUri = `obsidian://new?vault=${encodedVault}&file=vocabulary&content=${encodedData}&append=true`;

    try {
      window.location.href = advancedUri;
      setTimeout(() => {
        // Fallback test
        window.location.href = standardUri;
      }, 500);
      return true;
    } catch (e) {
      console.warn('Obsidian URI scheme dispatch error:', e);
      return false;
    }
  }

  // 2. Self-Hosted Server Sync (Saves to server host filesystem)
  async saveToObsidianServer(podcastTitle = 'German Reading', customVaultPath = '') {
    if (this.vocabList.length === 0) {
      return { status: 'error', message: 'No vocabulary to save.' };
    }

    const title = (podcastTitle || 'Untitled Reading').trim();
    const payload = {
      podcastTitle: title,
      vocabulary: this.vocabList,
      vaultPath: customVaultPath || localStorage.getItem('obsidian_custom_path') || ''
    };

    try {
      const response = await fetch('/api/save-obsidian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        return { status: 'success', filePath: data.filePath, count: data.count };
      } else {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Server responded with ${response.status}`);
      }
    } catch (e) {
      console.warn('Server sync failed:', e);
      return { status: 'error', message: e.message };
    }
  }

  // 3. Direct Markdown Download / iPad Files App Share
  async exportObsidianMarkdown(podcastTitle = 'German Reading') {
    if (this.vocabList.length === 0) {
      alert('No vocabulary words to export.');
      return;
    }

    const title = (podcastTitle || 'German_Reading').trim();
    const cleanFileName = `${title.replace(/[^a-zA-Z0-9_\u00C0-\u017F-]/g, '_')}_vocabulary.md`;
    const mdContent = this.generateObsidianMarkdown(title);

    // If Web Share API with file support is available on iPad Safari, offer native share sheet!
    if (navigator.canShare && typeof File !== 'undefined') {
      try {
        const file = new File([mdContent], cleanFileName, { type: 'text/markdown;charset=utf-8' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `WortSchatz • ${title}`,
            text: `German Vocabulary from ${title}`
          });
          return true;
        }
      } catch (err) {
        // User cancelled or unsupported, fallback to regular download
        if (err.name === 'AbortError') return true;
      }
    }

    this.downloadFile(cleanFileName, mdContent, 'text/markdown;charset=utf-8;');
    return true;
  }

  // Anki TSV Export with Authentic German Orthography & Grammar Genders
  exportAnki(deckName = 'WortSchatz') {
    if (this.vocabList.length === 0) {
      alert('No vocabulary to export.');
      return;
    }

    // Standard Anki tab-delimited format:
    // Front: German word with gender article (e.g. "der König", "die Straße")
    // Back: English meaning with Grammatical Gender & Class, example sentence
    // Tags: deckName WortSchatz
    const rows = this.vocabList.map(v => {
      const article = v.gender ? `${v.gender.split(' ')[0]} ` : '';
      const front = `${article}${v.german}`.trim();
      
      let metaInfo = [];
      if (v.gender) metaInfo.push(v.gender);
      if (v.pos) metaInfo.push(v.pos);
      if (v.pageNum) metaInfo.push(`Page ${v.pageNum}`);
      
      const metaHtml = metaInfo.length > 0 ? `<br><small style="color:#64748b;">(${metaInfo.join(' • ')})</small>` : '';
      const exampleHtml = v.example ? `<br><blockquote style="font-style:italic;margin-top:6px;color:#334155;">„${v.example}“</blockquote>` : '';
      
      const back = `${v.english}${metaHtml}${exampleHtml}`;
      const tags = `${deckName.replace(/\s+/g, '_')} WortSchatz German_B2_C1`;

      return `${front}\t${back}\t${tags}`;
    }).join('\n');

    this.downloadFile('wortschatz_anki_deck.tsv', rows, 'text/tab-separated-values;charset=utf-8;');
  }

  exportCSV() {
    if (this.vocabList.length === 0) {
      alert('No vocabulary to export.');
      return;
    }
    const header = 'German,English,Gender,Part of Speech,Page,Added At,Frequency\n';
    const rows = this.vocabList.map(v => 
      `"${(v.german || '').replace(/"/g, '""')}","${(v.english || '').replace(/"/g, '""')}","${(v.gender || '').replace(/"/g, '""')}","${v.pos || ''}",${v.pageNum || 1},"${v.addedAt || ''}",${v.count || 1}`
    ).join('\n');
    
    this.downloadFile('german_vocabulary.csv', header + rows, 'text/csv;charset=utf-8;');
  }

  exportJSON() {
    if (this.vocabList.length === 0) {
      alert('No vocabulary to export.');
      return;
    }
    const jsonStr = JSON.stringify(this.vocabList, null, 2);
    this.downloadFile('german_vocabulary.json', jsonStr, 'application/json');
  }

  downloadFile(fileName, content, mimeType) {
    if (typeof Blob === 'undefined' || typeof document === 'undefined') return;
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }
}

window.VocabularyManager = VocabularyManager;
window.vocabularyManager = new VocabularyManager();
