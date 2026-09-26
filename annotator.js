// Professional PDF Annotator & Live Smart Glossary Stream (Unlimited Cards & Filterable)
class PDFAnnotator {
  constructor() {
    this.annotations = [];
    this.undoStack = [];
    this.currentPdfBytes = null;
    this.isEraserMode = false;
    this.currentDocKey = 'sample_german_pdf';
    this.filterMode = 'all'; // 'all' or 'currentPage'
    this.searchQuery = '';
    this.loadFromStorage();
  }

  setDocumentKey(docKey) {
    this.currentDocKey = (docKey || 'default_document').replace(/[^a-zA-Z0-9_-]/g, '_');
    this.loadFromStorage();
    this.renderAll();
  }

  saveToStorage() {
    if (!this.currentDocKey || typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(`pdf_annotations_${this.currentDocKey}`, JSON.stringify(this.annotations));
    } catch (e) {
      console.warn('Failed to save annotations to storage:', e);
    }
  }

  loadFromStorage() {
    if (!this.currentDocKey || typeof localStorage === 'undefined') return;
    try {
      const saved = localStorage.getItem(`pdf_annotations_${this.currentDocKey}`);
      this.annotations = saved ? JSON.parse(saved) : [];
    } catch (e) {
      this.annotations = [];
    }
  }

  setOriginalPdfBytes(bytes) {
    this.currentPdfBytes = bytes;
  }

  setEraserMode(enabled) {
    this.isEraserMode = enabled;
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('eraser-mode-active', enabled);
    }
  }

  setFilterMode(mode) {
    this.filterMode = mode;
    this.renderGlossarySidebarStream();
  }

  setSearchQuery(q) {
    this.searchQuery = (q || '').trim().toLowerCase();
    this.renderGlossarySidebarStream();
  }

  addAnnotation({ pageNum, text, translation, rects, pdfRects, color = '#fef08a', pos = 'word', gender = null }) {
    const id = 'ann_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    const annotation = {
      id,
      pageNum,
      text: text.trim(),
      translation: translation.trim(),
      rects: rects || [],
      pdfRects: pdfRects || [],
      color: color || '#fef08a',
      pos: pos || 'word',
      gender: gender || null,
      timestamp: new Date().toISOString()
    };

    // No limit! Add unconditionally to array
    this.annotations.push(annotation);
    this.undoStack.push({ action: 'add', annotation });
    this.renderAll();
    this.saveToStorage();

    // Auto-scroll sidebar to newly added card
    setTimeout(() => {
      const cardEl = document.querySelector(`.gloss-card-modern[data-annotation-id="${id}"]`);
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        cardEl.classList.add('pulse-highlight');
        setTimeout(() => cardEl.classList.remove('pulse-highlight'), 1200);
      }
    }, 50);

    return annotation;
  }

  removeAnnotation(id) {
    const ann = this.annotations.find(a => a.id === id);
    if (!ann) return;

    this.annotations = this.annotations.filter(a => a.id !== id);
    this.undoStack.push({ action: 'remove', annotation: ann });
    this.renderAll();
    this.saveToStorage();

    if (window.vocabularyManager) {
      window.vocabularyManager.removeByText(ann.text);
    }
  }

  undoLastAction() {
    if (this.undoStack.length === 0) return false;
    const last = this.undoStack.pop();
    if (last.action === 'add') {
      this.annotations = this.annotations.filter(a => a.id !== last.annotation.id);
      this.renderAll();
      this.saveToStorage();
      if (window.vocabularyManager) {
        window.vocabularyManager.removeByText(last.annotation.text);
      }
      return true;
    } else if (last.action === 'remove') {
      this.annotations.push(last.annotation);
      this.renderAll();
      this.saveToStorage();
      if (window.vocabularyManager) {
        window.vocabularyManager.addWord({
          german: last.annotation.text,
          english: last.annotation.translation,
          pageNum: last.annotation.pageNum,
          pos: last.annotation.pos,
          gender: last.annotation.gender,
          annotationId: last.annotation.id
        });
      }
      return true;
    }
    return false;
  }

  clearAll() {
    this.annotations = [];
    this.undoStack = [];
    this.renderAll();
    this.saveToStorage();
  }

  renderAll() {
    if (typeof document === 'undefined') return;
    
    // Render text highlights on all rendered pages
    const totalRenderedPages = document.querySelectorAll('.page').length;
    for (let p = 1; p <= totalRenderedPages; p++) {
      this.renderPageCanvasHighlights(p);
    }

    // Render unlimited scrollable stream in the Right Sidebar
    this.renderGlossarySidebarStream();
  }

  renderPageCanvasHighlights(pageNum) {
    const pageWrapper = document.querySelector(`.page[data-page-number="${pageNum}"]`);
    if (!pageWrapper) return;

    let customLayer = pageWrapper.querySelector('.annotation-layer-custom');
    if (!customLayer) {
      customLayer = document.createElement('div');
      customLayer.className = 'annotation-layer-custom';
      pageWrapper.appendChild(customLayer);
    }
    customLayer.innerHTML = '';

    const pageAnns = this.annotations.filter(a => a.pageNum === pageNum);
    pageAnns.forEach(ann => {
      ann.rects.forEach(r => {
        const hl = document.createElement('div');
        hl.className = 'pdf-annotation-highlight';
        hl.setAttribute('data-annotation-id', ann.id);
        hl.style.left = `${r.x}px`;
        hl.style.top = `${r.y}px`;
        hl.style.width = `${r.width}px`;
        hl.style.height = `${r.height}px`;
        hl.title = `${ann.text} = ${ann.translation}`;

        hl.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.isEraserMode) {
            this.removeAnnotation(ann.id);
          } else {
            // Flash/show popup card at this highlight location!
            if (window.renderTranslationPopupForAnnotation) {
              const rect = hl.getBoundingClientRect();
              window.renderTranslationPopupForAnnotation(ann, {
                x: rect.left + rect.width / 2,
                y: rect.top - 8,
                bottomY: rect.bottom + 8
              }, true);
            }
            // If sidebar card is in DOM, also scroll & pulse it
            const cardEl = document.querySelector(`.gloss-card-modern[data-annotation-id="${ann.id}"]`);
            if (cardEl) {
              cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              cardEl.classList.add('pulse-highlight');
              setTimeout(() => cardEl.classList.remove('pulse-highlight'), 1200);
            }
          }
        });

        // Hover handling for desktop
        hl.addEventListener('mouseenter', (e) => {
          if (this.isEraserMode) return;
          if (window.onHighlightHoverEnter) {
            const rect = hl.getBoundingClientRect();
            window.onHighlightHoverEnter(ann, {
              x: rect.left + rect.width / 2,
              y: rect.top - 8,
              bottomY: rect.bottom + 8
            });
          }
        });

        hl.addEventListener('mouseleave', (e) => {
          if (window.onHighlightHoverLeave) {
            window.onHighlightHoverLeave();
          }
        });

        customLayer.appendChild(hl);
      });
    });
  }

  renderGlossarySidebarStream() {
    const streamContainer = document.getElementById('glossary-stream-list');
    const badge = document.getElementById('gloss-count-badge');
    if (!streamContainer) return;

    const curPage = window.pdfViewer ? window.pdfViewer.currentPage : 1;
    let list = this.annotations;

    if (this.filterMode === 'currentPage') {
      list = list.filter(a => a.pageNum === curPage);
    }

    if (this.searchQuery) {
      list = list.filter(a => a.text.toLowerCase().includes(this.searchQuery) || a.translation.toLowerCase().includes(this.searchQuery));
    }

    if (badge) {
      badge.textContent = `${this.annotations.length} words`;
    }
    const edgeBadge = document.getElementById('edge-vocab-badge');
    if (edgeBadge) {
      edgeBadge.textContent = this.annotations.length;
    }

    if (list.length === 0) {
      streamContainer.innerHTML = `
        <div class="glossary-empty">
          <i data-lucide="mouse-pointer-click"></i>
          <p>${this.annotations.length === 0 ? 'Tap or select any German word to build your vocabulary list.' : 'No vocabulary matching current page / filter.'}</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    streamContainer.innerHTML = '';
    
    // Reverse chronological order (latest on top)
    const reversed = [...list].reverse();
    reversed.forEach((ann) => {
      const card = document.createElement('div');
      card.className = 'gloss-card-modern';
      card.setAttribute('data-annotation-id', ann.id);

      // Format POS tag cleanly (e.g. (v.), (n.), (adj.))
      let posTag = '';
      if (ann.pos) {
        if (ann.pos.includes('verb')) posTag = '(v.)';
        else if (ann.pos.includes('noun') || ann.pos.includes('Substantiv')) posTag = ann.gender ? `(${ann.gender.split(' ')[0]}, n.)` : '(n.)';
        else if (ann.pos.includes('adj')) posTag = '(adj.)';
        else if (ann.pos.includes('adv')) posTag = '(adv.)';
        else posTag = `(${ann.pos})`;
      } else if (ann.gender) {
        posTag = `(${ann.gender.split(' ')[0]}, n.)`;
      }

      // Compute Morphology data
      const morphData = window.GermanMorphologyEngine ? window.GermanMorphologyEngine.getMorphology(ann.text) : null;
      const hasFamily = morphData && morphData.wordFamily && morphData.wordFamily.length > 0;
      const hasPrefixes = morphData && morphData.prefixes && morphData.prefixes.length > 0;
      const hasSeparable = morphData && morphData.separableVerbs && morphData.separableVerbs.length > 0;
      const hasSuffixes = morphData && morphData.suffixes && morphData.suffixes.length > 0;
      const hasAnyMorph = hasFamily || hasPrefixes || hasSeparable || hasSuffixes;

      // Card Inner HTML matching the user reference prototype image
      card.innerHTML = `
        <div class="gloss-card-brand">
          <div class="brand-title">WortSchatz</div>
          <div class="brand-sub">German vocabulary</div>
        </div>

        <div class="gloss-main-word-row">
          <span class="gloss-word-title">${escapeHtml(ann.text)}</span>
          ${posTag ? `<span class="gloss-pos-sub">${escapeHtml(posTag)}</span>` : ''}
        </div>

        <div class="gloss-meaning-row">
          <button class="gloss-audio-btn" title="Pronounce Audio"><i data-lucide="volume-2"></i></button>
          <span class="gloss-card-meaning">${escapeHtml(ann.translation)}</span>
        </div>

        ${hasAnyMorph ? `
        <div class="gloss-toggle-section">
          <div class="gloss-switch-row">
            <span class="gloss-switch-label">Explore Word Family / Wortfamilie</span>
            <div style="display:flex; align-items:center; gap:6px;">
              <label class="ios-switch">
                <input type="checkbox" class="morph-master-switch">
                <span class="ios-slider"></span>
              </label>
              <button class="icon-btn-tiny danger gloss-del-btn" title="Remove">&times;</button>
            </div>
          </div>

          <div class="gloss-morph-drawer" style="display:none;">
            <div class="gloss-morph-bar">
              ${hasFamily ? `<button class="morph-pill active" data-morph="family"><i data-lucide="sprout"></i> Wortfamilie</button>` : ''}
              ${hasPrefixes ? `<button class="morph-pill ${!hasFamily ? 'active' : ''}" data-morph="prefixes"><i data-lucide="shuffle"></i> Präfixe</button>` : ''}
              ${hasSeparable ? `<button class="morph-pill ${!hasFamily && !hasPrefixes ? 'active' : ''}" data-morph="separable"><i data-lucide="scissors"></i> Trennbar</button>` : ''}
              ${hasSuffixes ? `<button class="morph-pill ${!hasFamily && !hasPrefixes && !hasSeparable ? 'active' : ''}" data-morph="suffixes"><i data-lucide="link"></i> Suffixe</button>` : ''}
            </div>
            <div class="gloss-morph-stream"></div>
          </div>
        </div>
        ` : `
        <div class="gloss-switch-row">
          <span class="gloss-switch-label" style="font-size:11px;">Page ${ann.pageNum}</span>
          <button class="icon-btn-tiny danger gloss-del-btn" title="Remove">&times;</button>
        </div>
        `}
      `;

      // Master Toggle Switch & Morphology Stream Logic
      if (hasAnyMorph) {
        const switchInput = card.querySelector('.morph-master-switch');
        const morphDrawer = card.querySelector('.gloss-morph-drawer');
        const morphBar = card.querySelector('.gloss-morph-bar');
        const morphStream = card.querySelector('.gloss-morph-stream');

        const updateStreamContent = (type) => {
          let items = [];
          let sectionTitle = '';
          if (type === 'family') {
            items = morphData.wordFamily;
            sectionTitle = '🌱 Wortfamilie & Ableitungen';
          } else if (type === 'prefixes') {
            items = morphData.prefixes;
            sectionTitle = '🔀 Präfixe & Bedeutungswechsel';
          } else if (type === 'separable') {
            items = morphData.separableVerbs;
            sectionTitle = '✂️ Trennbare Verben';
          } else if (type === 'suffixes') {
            items = morphData.suffixes;
            sectionTitle = '🧩 Suffixe & Wortarten';
          }
          this.renderMorphStream(morphStream, items, sectionTitle);
        };

        if (switchInput && morphDrawer && morphBar && morphStream) {
          switchInput.addEventListener('change', (e) => {
            e.stopPropagation();
            if (switchInput.checked) {
              morphDrawer.style.display = 'block';
              const activePill = morphBar.querySelector('.morph-pill.active') || morphBar.querySelector('.morph-pill');
              const morphType = activePill ? activePill.getAttribute('data-morph') : 'family';
              updateStreamContent(morphType);
            } else {
              morphDrawer.style.display = 'none';
              morphStream.innerHTML = '';
            }
          });

          // Sub-pills click
          morphBar.querySelectorAll('.morph-pill').forEach(pill => {
            pill.addEventListener('click', (e) => {
              e.stopPropagation();
              morphBar.querySelectorAll('.morph-pill').forEach(p => p.classList.remove('active'));
              pill.classList.add('active');
              const morphType = pill.getAttribute('data-morph');
              updateStreamContent(morphType);
            });
          });
        }
      }

      // Pronounce Audio
      const audioBtn = card.querySelector('.gloss-audio-btn');
      if (audioBtn) {
        audioBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (window.germanSpeech) window.germanSpeech.speak(ann.text);
        });
      }

      // Delete annotation
      const delBtn = card.querySelector('.gloss-del-btn');
      if (delBtn) {
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.removeAnnotation(ann.id);
        });
      }

      // Card click scrolls to page
      card.addEventListener('click', () => {
        const pageEl = document.getElementById(`pdf-page-${ann.pageNum}`);
        if (pageEl) {
          pageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        const hl = document.querySelector(`.pdf-annotation-highlight[data-annotation-id="${ann.id}"]`);
        if (hl) {
          hl.style.backgroundColor = 'rgba(250, 204, 21, 0.9)';
          setTimeout(() => {
            hl.style.backgroundColor = '';
          }, 1000);
        }
      });

      streamContainer.appendChild(card);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  renderMorphStream(container, items, title) {
    if (!container || !items || items.length === 0) {
      if (container) {
        container.innerHTML = '';
      }
      return;
    }

    let html = '';
    items.forEach((it, idx) => {
      let posTag = '';
      if (it.pos) {
        if (it.pos.includes('verb')) posTag = '(v.)';
        else if (it.pos.includes('noun')) posTag = it.article ? `(${it.article}, n.)` : '(n.)';
        else if (it.pos.includes('adj')) posTag = '(adj.)';
        else posTag = `(${it.pos})`;
      } else if (it.article) {
        posTag = `(${it.article}, n.)`;
      }

      html += `
        <div class="morph-item-row" data-index="${idx}">
          <div class="morph-item-main">
            <span class="morph-word-term">${escapeHtml(it.word)}</span>
            ${posTag ? `<span class="morph-item-pos-tag">${escapeHtml(posTag)}</span>` : ''}
            ${it.translation ? `<span class="morph-item-meaning-bracket">[${escapeHtml(it.translation)}]</span>` : ''}
          </div>
          <div class="morph-item-actions">
            <button class="icon-btn-tiny morph-audio-btn" title="Pronounce Audio"><i data-lucide="volume-2"></i></button>
            <button class="icon-btn-tiny morph-add-btn" title="Save to Vocabulary"><i data-lucide="plus"></i></button>
            <i data-lucide="chevron-down" style="width:13px; height:13px; color:#9ca3af; margin-left:1px;"></i>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();

    // Attach row action listeners
    container.querySelectorAll('.morph-audio-btn').forEach((btn, idx) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const raw = (items[idx].rawWord || items[idx].word || '').replace(/^(der|die|das)s+/i, '');
        if (window.germanSpeech) window.germanSpeech.speak(raw);
      });
    });

    container.querySelectorAll('.morph-add-btn').forEach((btn, idx) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const it = items[idx];
        if (window.vocabularyManager) {
          window.vocabularyManager.addWord({
            german: it.word,
            english: it.translation,
            pageNum: 1,
            pos: it.pos,
            gender: it.article
          });
          if (typeof showToast === 'function') {
            showToast(`✓ Added "${it.word}" to vocabulary!`);
          }
        }
      });
    });
  }

  redrawPageAnnotations(pageNum, viewport) {
    if (typeof document === 'undefined') return;
    const pageAnns = this.annotations.filter(a => a.pageNum === pageNum);
    pageAnns.forEach(ann => {
      const domRects = ann.pdfRects.map(pr => {
        const p1 = viewport.convertToViewportPoint(pr.x, pr.y);
        const p2 = viewport.convertToViewportPoint(pr.x + pr.width, pr.y + pr.height);
        return {
          x: Math.min(p1[0], p2[0]),
          y: Math.min(p1[1], p2[1]),
          width: Math.abs(p2[0] - p1[0]),
          height: Math.abs(p2[1] - p1[1])
        };
      });
      ann.rects = domRects;
    });

    this.renderPageCanvasHighlights(pageNum);
  }

  // Export Real Vector Annotated PDF (Overflow-Safe Stacking)
  async exportAnnotatedPdf(fileName = 'german_document_annotated.pdf') {
    if (!this.currentPdfBytes) {
      alert('No PDF document loaded.');
      return;
    }

    if (typeof PDFLib === 'undefined') {
      alert('PDFLib is loading. Please retry in a moment.');
      return;
    }

    try {
      const pdfDoc = await PDFLib.PDFDocument.load(this.currentPdfBytes);
      const pages = pdfDoc.getPages();
      const helveticaBold = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);

      // Group annotations by page
      for (let pIndex = 0; pIndex < pages.length; pIndex++) {
        const pageNum = pIndex + 1;
        const page = pages[pIndex];
        const { height: pageHeight, width: pageWidth } = page.getSize();
        const pageAnns = this.annotations.filter(a => a.pageNum === pageNum);

        // 1. Draw yellow highlight boxes over all words
        for (const ann of pageAnns) {
          for (const pr of ann.pdfRects) {
            page.drawRectangle({
              x: pr.x,
              y: pr.y,
              width: pr.width,
              height: pr.height,
              color: PDFLib.rgb(1.0, 0.94, 0.2),
              opacity: 0.45,
              blendMode: PDFLib.BlendMode?.Multiply || undefined
            });
          }
        }

        // 2. Overflow-safe right margin stacking
        let currentStackY = pageHeight - 30;
        const tagHeight = 12;
        const marginPadding = 8;

        for (const ann of pageAnns) {
          if (currentStackY < 20) {
            // If margin height is completely filled, wrap or adjust gracefully
            currentStackY = pageHeight - 30;
          }

          const safeTranslation = ann.translation.replace(/[^\x00-\x7F]/g, '');
          const textToDraw = `${ann.text}: ${safeTranslation || ann.translation}`;
          const fontSize = 7.0;
          const textWidth = Math.min(helveticaBold.widthOfTextAtSize(textToDraw, fontSize), 110);
          
          const textX = pageWidth - textWidth - marginPadding - 4;

          page.drawRectangle({
            x: textX - 2,
            y: currentStackY - 2,
            width: textWidth + 4,
            height: tagHeight,
            color: PDFLib.rgb(0.99, 0.99, 0.94),
            borderColor: PDFLib.rgb(0.9, 0.8, 0.2),
            borderWidth: 0.5,
            opacity: 0.95
          });

          page.drawText(textToDraw.slice(0, 24), {
            x: textX,
            y: currentStackY,
            size: fontSize,
            font: helveticaBold,
            color: PDFLib.rgb(0.1, 0.15, 0.3)
          });

          currentStackY -= (tagHeight + 3);
        }
      }

      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      return true;
    } catch (err) {
      console.error('Error generating annotated PDF:', err);
      alert('Failed to generate annotated PDF: ' + err.message);
      return false;
    }
  }
}

window.pdfAnnotator = new PDFAnnotator();
