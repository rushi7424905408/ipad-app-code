// Master Application Controller (Bulletproof File Upload & Obsidian Sync)

function setDocumentTitle(name) {
  const podcastInput = document.getElementById('podcast-title-input');
  if (podcastInput) {
    const cleanName = name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
    podcastInput.value = cleanName;
  }
}

function escapeHtml(text) {
  if (!text) return '';
  return text.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showToast(msg, duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

document.addEventListener('DOMContentLoaded', () => {
  const viewerContainer = document.getElementById('pdf-viewer-container');
  const fileInput = document.getElementById('pdf-file-input');
  const popup = document.getElementById('translation-popup');
  const inspector = document.getElementById('annotation-inspector');
  const vocabDrawer = document.getElementById('vocab-drawer');
  const autoAnnotateToggle = document.getElementById('toggle-auto-annotate');
  const eraserToggle = document.getElementById('btn-toggle-eraser');
  const undoBtn = document.getElementById('btn-undo');
  
  let currentSelectionData = null;
  let activeTheme = localStorage.getItem('theme') || 'light';

  document.documentElement.setAttribute('data-theme', activeTheme);
  updateThemeIcon();

  if (window.lucide) window.lucide.createIcons();

  // Smart Popup Positioning (clamps within viewport, avoids topbar)
  function positionPopup(pos) {
    if (!popup) return;
    popup.style.display = 'block';
    popup.style.visibility = 'visible';
    popup.style.opacity = '1';
    popup.style.zIndex = '99999';

    const popupRect = popup.getBoundingClientRect();
    const popupW = popupRect.width || 330;
    const popupH = popupRect.height || 260;
    const margin = 12;

    const safeX = (pos && isFinite(pos.x) && pos.x > 0) ? pos.x : (window.innerWidth / 2);
    const safeY = (pos && isFinite(pos.y) && pos.y > 0) ? pos.y : (window.innerHeight / 2);
    const safeBottomY = (pos && isFinite(pos.bottomY) && pos.bottomY > 0) ? pos.bottomY : (safeY + 28);

    // Horizontal clamping
    let left = safeX - (popupW / 2);
    if (left < margin) left = margin;
    if (left + popupW > window.innerWidth - margin) {
      left = Math.max(margin, window.innerWidth - popupW - margin);
    }

    // Vertical clamping (prefer above word; if too close to topbar, place below word)
    let top = safeY - popupH - 8;
    if (top < margin + 48) {
      top = safeBottomY + 8;
    }
    if (top + popupH > window.innerHeight - margin) {
      top = Math.max(margin + 48, window.innerHeight - popupH - margin);
    }

    popup.style.left = `${Math.round(left)}px`;
    popup.style.top = `${Math.round(top)}px`;
  }

  // Hover Grace-Period & Interactive Card Handling
  let popupMode = null; // null, 'hover', or 'pinned'
  let popupDismissTimer = null;
  let isMouseOverPopup = false;

  popup.addEventListener('mouseenter', () => {
    isMouseOverPopup = true;
    if (popupDismissTimer) {
      clearTimeout(popupDismissTimer);
      popupDismissTimer = null;
    }
  });

  popup.addEventListener('mouseleave', () => {
    isMouseOverPopup = false;
    // Only auto-dismiss if in hover mode, never when pinned by selection!
    if (popupMode === 'hover') {
      popupDismissTimer = setTimeout(() => {
        dismissTranslationPopup();
      }, 350);
    }
  });

  window.onHighlightHoverEnter = (ann, pos) => {
    if (popupDismissTimer) {
      clearTimeout(popupDismissTimer);
      popupDismissTimer = null;
    }
    // Only trigger hover preview if not already pinned by an explicit tap/selection
    if (popupMode !== 'pinned') {
      popupMode = 'hover';
      window.renderTranslationPopupForAnnotation(ann, pos, false);
    }
  };

  window.onHighlightHoverLeave = () => {
    // CRITICAL: NEVER auto-dismiss if pinned by selection/tap!
    if (popupMode === 'pinned') return;

    if (popupDismissTimer) clearTimeout(popupDismissTimer);
    popupDismissTimer = setTimeout(() => {
      if (!isMouseOverPopup && popupMode === 'hover') {
        dismissTranslationPopup();
      }
    }, 350);
  };

  window.renderTranslationPopupForAnnotation = async (ann, pos, isPinned = false) => {
    if (isPinned) {
      popupMode = 'pinned';
      if (popupDismissTimer) {
        clearTimeout(popupDismissTimer);
        popupDismissTimer = null;
      }
    }
    let trans = await window.translator.translate(ann.text);
    if (!trans || !trans.english) {
      trans = {
        german: ann.text,
        english: ann.translation,
        pos: ann.pos || '',
        gender: ann.gender || ''
      };
    }
    renderTranslationPopup(trans, pos);
  };

  // Temporary Selection Preview Helper
  function clearPreviewHighlights() {
    document.querySelectorAll('.pdf-selection-preview').forEach(el => el.remove());
  }
  window.clearPreviewHighlights = clearPreviewHighlights;

  function showPreviewHighlights(pageNum, domRects) {
    clearPreviewHighlights();
    if (!domRects || domRects.length === 0) return;
    const pageWrapper = document.querySelector(`.page[data-page-number="${pageNum}"]`);
    if (!pageWrapper) return;

    let layer = pageWrapper.querySelector('.annotation-layer-custom');
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'annotation-layer-custom';
      pageWrapper.appendChild(layer);
    }

    domRects.forEach(r => {
      const el = document.createElement('div');
      el.className = 'pdf-selection-preview';
      el.style.left = `${r.x}px`;
      el.style.top = `${r.y}px`;
      el.style.width = `${r.width}px`;
      el.style.height = `${r.height}px`;
      layer.appendChild(el);
    });
  }

  // Selection Handler
  window.pdfViewer.onSelection(async (selectionData) => {
    if (window.pdfAnnotator.isEraserMode) return;

    // PIN the card so it stays open for the user to read
    popupMode = 'pinned';
    if (popupDismissTimer) {
      clearTimeout(popupDismissTimer);
      popupDismissTimer = null;
    }

    currentSelectionData = selectionData;
    const { text, popupPos, pageNum, domRects } = selectionData;

    dismissAnnotationInspector();

    // 1. Show temporary visual selection box over the word or sentence
    showPreviewHighlights(pageNum, domRects);

    // 2. Show loading popup
    showLoadingPopup(popupPos, text);

    // 3. Perform translation
    const trans = await window.translator.translate(text);
    renderTranslationPopup(trans, popupPos);

    // Only auto-annotate if the user explicitly switched on the Auto-Highlight toggle in bottom island
    if (autoAnnotateToggle && autoAnnotateToggle.checked && trans && trans.english) {
      clearPreviewHighlights();
      applyAnnotation(selectionData, trans);
    }
  });

  // Tap or click outside to dismiss pinned popup cleanly
  document.addEventListener('pointerdown', (e) => {
    if (!popup || popup.style.display === 'none') return;
    if (e.target.closest('#translation-popup') || 
        e.target.closest('.pdf-annotation-highlight') || 
        e.target.closest('.bottom-tools-island') ||
        e.target.closest('.toolbar') ||
        e.target.closest('.island-tool-btn')) {
      return;
    }
    dismissTranslationPopup();
  });

  function applyAnnotation(selData, trans, color = '#fef08a') {
    const ann = window.pdfAnnotator.addAnnotation({
      pageNum: selData.pageNum,
      text: trans.german,
      translation: trans.english,
      rects: selData.domRects,
      pdfRects: selData.pdfRects,
      color: color,
      pos: trans.pos,
      gender: trans.gender
    });

    window.vocabularyManager.addWord({
      german: trans.german,
      english: trans.english,
      pageNum: selData.pageNum,
      pos: trans.pos,
      gender: trans.gender,
      example: trans.example,
      annotationId: ann.id
    });
  }

  function showLoadingPopup(pos, word) {
    popup.style.display = 'block';
    popup.innerHTML = `
      <div class="popup-header">
        <span class="popup-word">${escapeHtml(word)}</span>
        <div class="spinner-sm"></div>
      </div>
      <div class="popup-translation" style="color:var(--text-muted); font-size:12px;">
        Translating German text...
      </div>
    `;
    positionPopup(pos);
  }

  function renderTranslationPopup(trans, pos) {
    popup.style.display = 'block';

    // Format POS tag
    let posTag = '';
    if (trans.pos) {
      if (trans.pos.includes('verb')) posTag = '(v.)';
      else if (trans.pos.includes('noun')) posTag = trans.gender ? `(${trans.gender.split(' ')[0]}, n.)` : '(n.)';
      else if (trans.pos.includes('adj')) posTag = '(adj.)';
      else posTag = `(${trans.pos})`;
    } else if (trans.gender) {
      posTag = `(${trans.gender.split(' ')[0]}, n.)`;
    }
    
    let synonymsHtml = '';
    if (trans.synonyms && trans.synonyms.length > 0) {
      const synList = trans.synonyms[0].words.slice(0, 3).join(', ');
      if (synList) {
        synonymsHtml = `<div style="font-size:11px; color:var(--text-muted); margin-bottom:4px;"><span style="font-weight:600;">Also:</span> ${escapeHtml(synList)}</div>`;
      }
    }

    // Compute Morphology data for popup
    const morphData = window.GermanMorphologyEngine ? window.GermanMorphologyEngine.getMorphology(trans.german) : null;
    const hasFamily = morphData && morphData.wordFamily && morphData.wordFamily.length > 0;
    const hasPrefixes = morphData && morphData.prefixes && morphData.prefixes.length > 0;
    const hasSeparable = morphData && morphData.separableVerbs && morphData.separableVerbs.length > 0;
    const hasSuffixes = morphData && morphData.suffixes && morphData.suffixes.length > 0;
    const hasAnyMorph = hasFamily || hasPrefixes || hasSeparable || hasSuffixes;

    popup.innerHTML = `
      <div class="popup-header" style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div class="gloss-card-brand">
          <div class="brand-title" style="font-size:12px;">WortSchatz</div>
          <div class="brand-sub" style="font-size:10px;">German vocabulary</div>
        </div>
        <button id="popup-close-btn" class="icon-btn-tiny" title="Close">&times;</button>
      </div>

      <div class="gloss-main-word-row" style="margin-top:2px;">
        <span class="gloss-word-title" style="font-size:20px;">${escapeHtml(trans.german)}</span>
        ${posTag ? `<span class="gloss-pos-sub" style="font-size:13px;">${escapeHtml(posTag)}</span>` : ''}
      </div>

      <div class="gloss-meaning-row" style="margin-bottom:6px;">
        <button id="popup-tts-btn" class="gloss-audio-btn" title="Pronounce Audio" style="width:24px; height:24px;">
          <i data-lucide="volume-2" style="width:13px; height:13px;"></i>
        </button>
        <span class="gloss-card-meaning" style="font-size:13.5px;">${escapeHtml(trans.english)}</span>
      </div>

      ${synonymsHtml}

      ${hasAnyMorph ? `
      <div class="gloss-toggle-section">
        <div class="gloss-switch-row" style="padding-top:6px; margin-top:2px;">
          <span class="gloss-switch-label" style="font-size:11.5px;">Explore Word Family / Wortfamilie</span>
          <label class="ios-switch" style="width:38px; height:20px;">
            <input type="checkbox" class="morph-master-switch" id="popup-morph-switch">
            <span class="ios-slider"></span>
          </label>
        </div>

        <div class="gloss-morph-drawer popup-morph-drawer" style="display:none;">
          <div class="gloss-morph-bar" style="margin-top:6px; padding-top:4px;">
            ${hasFamily ? `<button class="morph-pill active" data-morph="family"><i data-lucide="sprout"></i> Wortfamilie</button>` : ''}
            ${hasPrefixes ? `<button class="morph-pill ${!hasFamily ? 'active' : ''}" data-morph="prefixes"><i data-lucide="shuffle"></i> Präfixe</button>` : ''}
            ${hasSeparable ? `<button class="morph-pill ${!hasFamily && !hasPrefixes ? 'active' : ''}" data-morph="separable"><i data-lucide="scissors"></i> Trennbar</button>` : ''}
            ${hasSuffixes ? `<button class="morph-pill ${!hasFamily && !hasPrefixes && !hasSeparable ? 'active' : ''}" data-morph="suffixes"><i data-lucide="link"></i> Suffixe</button>` : ''}
          </div>
          <div class="gloss-morph-stream popup-morph-stream" style="max-height:140px; margin-top:6px;"></div>
        </div>
      </div>
      ` : ''}

      <div class="popup-actions" style="margin-top:10px;">
        <button class="btn-popup-primary" id="btn-popup-highlight">
          <i data-lucide="highlighter"></i> Highlight & Save
        </button>
        <button class="btn-popup-obsidian" id="btn-popup-obsidian" title="Save to Obsidian">
          <i data-lucide="book-down"></i> + Obsidian
        </button>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    positionPopup(pos);

    // Wire popup morphology toggle pills
    if (hasAnyMorph) {
      const pSwitch = popup.querySelector('#popup-morph-switch');
      const pDrawer = popup.querySelector('.popup-morph-drawer');
      const pMorphBar = popup.querySelector('.gloss-morph-bar');
      const pMorphStream = popup.querySelector('.popup-morph-stream');

      const updatePopupStream = (mType) => {
        let items = [];
        let sectionTitle = '';
        if (mType === 'family') { items = morphData.wordFamily; sectionTitle = '🌱 Wortfamilie'; }
        else if (mType === 'prefixes') { items = morphData.prefixes; sectionTitle = '🔀 Präfixe'; }
        else if (mType === 'separable') { items = morphData.separableVerbs; sectionTitle = '✂️ Trennbar'; }
        else if (mType === 'suffixes') { items = morphData.suffixes; sectionTitle = '🧩 Suffixe'; }

        if (window.pdfAnnotator) {
          window.pdfAnnotator.renderMorphStream(pMorphStream, items, sectionTitle);
        }
        positionPopup(pos);
      };

      if (pSwitch && pDrawer && pMorphBar && pMorphStream) {
        pSwitch.addEventListener('change', (e) => {
          e.stopPropagation();
          if (pSwitch.checked) {
            pDrawer.style.display = 'block';
            const activePill = pMorphBar.querySelector('.morph-pill.active') || pMorphBar.querySelector('.morph-pill');
            const mType = activePill ? activePill.getAttribute('data-morph') : 'family';
            updatePopupStream(mType);
          } else {
            pDrawer.style.display = 'none';
            pMorphStream.innerHTML = '';
            positionPopup(pos);
          }
        });

        pMorphBar.querySelectorAll('.morph-pill').forEach(pill => {
          pill.addEventListener('click', (e) => {
            e.stopPropagation();
            pMorphBar.querySelectorAll('.morph-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            const mType = pill.getAttribute('data-morph');
            updatePopupStream(mType);
          });
        });
      }
    }

    document.getElementById('popup-tts-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.germanSpeech) window.germanSpeech.speak(trans.german);
    });

    document.getElementById('popup-close-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      dismissTranslationPopup();
    });

    document.getElementById('btn-popup-highlight')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentSelectionData) {
        clearPreviewHighlights();
        applyAnnotation(currentSelectionData, trans);
        dismissTranslationPopup();
        showToast(`✓ Saved "${trans.german.slice(0, 24)}" to glossary!`);
      }
    });

    document.getElementById('btn-popup-obsidian')?.addEventListener('click', async (e) => {
      e.stopPropagation();
      const podcastTitle = document.getElementById('podcast-title-input')?.value.trim() || 'German Podcast';
      try {
        await fetch('/api/save-obsidian', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            podcast_title: podcastTitle,
            word: trans.german,
            translation: trans.english,
            page: currentSelectionData?.pageNum || 1,
            pos: trans.pos,
            gender: trans.gender
          })
        });
        showToast(`✓ Saved "${trans.german.slice(0, 24)}" to Obsidian Vault!`);
      } catch (err) {
        showToast(`Failed saving to Obsidian: ${err.message}`);
      }
      dismissTranslationPopup();
    });
  }

  function dismissTranslationPopup() {
    popup.style.display = 'none';
    currentSelectionData = null;
    clearPreviewHighlights();
    try {
      window.getSelection()?.removeAllRanges();
    } catch (e) {}
  }
  window.dismissTranslationPopup = dismissTranslationPopup;

  function dismissAnnotationInspector() {
    inspector.style.display = 'none';
  }

  // Bulletproof File Upload Handler
  async function handlePdfFile(file) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      alert('Please select a valid PDF file.');
      return;
    }

    dismissTranslationPopup();
    clearPreviewHighlights();
    setDocumentTitle(file.name);
    window._currentDocName = file.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const clone1 = arrayBuffer.slice(0);
      const clone2 = arrayBuffer.slice(0);
      await window.pdfViewer.loadDocument(clone1, clone2);
      showToast(`Loaded "${file.name}"`);
    } catch (err) {
      console.error('File load error:', err);
      alert('Failed to load selected PDF: ' + err.message);
    }
  }

  if (fileInput) {
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        await handlePdfFile(file);
        e.target.value = ''; // Reset so uploading same file again works
      }
    });
  }

  // Drag and Drop PDF support onto viewer window
  window.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  window.addEventListener('drop', async (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.toLowerCase().endsWith('.pdf')) {
        await handlePdfFile(file);
      }
    }
  });

  // Sample German PDF loader
  document.getElementById('btn-load-sample')?.addEventListener('click', async () => {
    setDocumentTitle('Künstliche Intelligenz (Sample.pdf)');
    if (window.SAMPLE_GERMAN_PDF_BASE64) {
      await window.pdfViewer.loadDocument(window.SAMPLE_GERMAN_PDF_BASE64);
    } else {
      await window.pdfViewer.loadDocument('sample_german.pdf');
    }
  });

  // Toolbar Controls
  document.getElementById('btn-zoom-in')?.addEventListener('click', () => window.pdfViewer.zoomIn());
  document.getElementById('btn-zoom-out')?.addEventListener('click', () => window.pdfViewer.zoomOut());
  document.getElementById('btn-zoom-fit')?.addEventListener('click', () => window.pdfViewer.zoomFitWidth());
  
  document.getElementById('btn-prev-page')?.addEventListener('click', () => {
    window.pdfViewer.goToPage(window.pdfViewer.currentPage - 1);
  });

  document.getElementById('btn-next-page')?.addEventListener('click', () => {
    window.pdfViewer.goToPage(window.pdfViewer.currentPage + 1);
  });

  document.getElementById('current-page-input')?.addEventListener('change', (e) => {
    const p = parseInt(e.target.value, 10);
    if (!isNaN(p)) window.pdfViewer.goToPage(p);
  });

  // Undo & Eraser
  undoBtn?.addEventListener('click', () => {
    if (window.pdfAnnotator.undoLastAction()) {
      showToast('Undid last highlight');
    }
  });

  eraserToggle?.addEventListener('click', () => {
    const isEraser = !window.pdfAnnotator.isEraserMode;
    window.pdfAnnotator.setEraserMode(isEraser);
    eraserToggle.classList.toggle('active', isEraser);
    showToast(isEraser ? 'Eraser active: Click any highlight to remove' : 'Eraser deactivated');
  });

  document.getElementById('btn-clear-all')?.addEventListener('click', () => {
    if (confirm('Clear all highlights from this document?')) {
      window.pdfAnnotator.clearAll();
      showToast('All highlights cleared');
    }
  });

  // Download Annotated PDF
  document.getElementById('btn-download-annotated')?.addEventListener('click', async () => {
    const rawTitle = document.getElementById('podcast-title-input')?.value || 'german_document';
    const cleanFileName = rawTitle.replace(/[^a-zA-Z0-9_-]/g, '_') + '_annotated.pdf';
    showToast('Generating annotated PDF...');
    await window.pdfAnnotator.exportAnnotatedPdf(cleanFileName);
  });

  // Live Smart Glossary Sidebar & Touch Resizer Controller
  const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
  const btnCollapseSidebar = document.getElementById('btn-collapse-sidebar');
  const btnSidebarEdgeTab = document.getElementById('btn-sidebar-edge-tab');
  const glossarySidebar = document.getElementById('glossary-sidebar');
  const sidebarResizer = document.getElementById('sidebar-resizer');
  const edgeVocabBadge = document.getElementById('edge-vocab-badge');

  let savedSidebarWidth = parseInt(localStorage.getItem('glossarySidebarWidth'), 10) || 290;

  function updateSidebarState(collapsed) {
    if (!glossarySidebar) return;
    if (collapsed) {
      glossarySidebar.classList.add('collapsed');
      sidebarResizer?.classList.add('hidden');
      btnSidebarEdgeTab?.classList.add('visible');
      btnToggleSidebar?.classList.remove('active');
      localStorage.setItem('glossarySidebarCollapsed', 'true');
    } else {
      glossarySidebar.classList.remove('collapsed');
      sidebarResizer?.classList.remove('hidden');
      btnSidebarEdgeTab?.classList.remove('visible');
      btnToggleSidebar?.classList.add('active');
      localStorage.setItem('glossarySidebarCollapsed', 'false');
      // Apply saved width
      glossarySidebar.style.width = savedSidebarWidth + 'px';
    }
    // Update badge on edge tab
    const count = window.pdfAnnotator?.annotations?.length || 0;
    if (edgeVocabBadge) edgeVocabBadge.textContent = count;

    setTimeout(() => {
      window.pdfViewer?.zoomFitWidth();
    }, 220);
  }

  // Toggle buttons
  btnToggleSidebar?.addEventListener('click', () => {
    const isCurrentlyCollapsed = glossarySidebar?.classList.contains('collapsed');
    updateSidebarState(!isCurrentlyCollapsed);
  });

  btnCollapseSidebar?.addEventListener('click', () => {
    updateSidebarState(true);
  });

  btnSidebarEdgeTab?.addEventListener('click', () => {
    updateSidebarState(false);
  });

  // Touch, Apple Pencil, and Mouse Resizer
  if (sidebarResizer && glossarySidebar) {
    let isDragging = false;
    let startX = 0;
    let startWidth = 0;

    const onPointerDown = (e) => {
      isDragging = true;
      startX = e.clientX;
      startWidth = glossarySidebar.getBoundingClientRect().width;
      sidebarResizer.classList.add('dragging');
      sidebarResizer.setPointerCapture?.(e.pointerId);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const deltaX = startX - e.clientX;
      let newWidth = startWidth + deltaX;

      const minWidth = 160;
      const maxWidth = Math.min(540, Math.floor(window.innerWidth * 0.65));

      // Snap-to-close threshold if dragged too narrow
      if (newWidth < 115) {
        updateSidebarState(true);
        isDragging = false;
        sidebarResizer.classList.remove('dragging');
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        return;
      }

      if (newWidth < minWidth) newWidth = minWidth;
      if (newWidth > maxWidth) newWidth = maxWidth;

      glossarySidebar.style.width = newWidth + 'px';
      savedSidebarWidth = newWidth;
    };

    const onPointerUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      sidebarResizer.classList.remove('dragging');
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      localStorage.setItem('glossarySidebarWidth', savedSidebarWidth);
      window.pdfViewer?.zoomFitWidth();
    };

    sidebarResizer.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    // Double-tap or double-click to toggle width / snap
    sidebarResizer.addEventListener('dblclick', () => {
      if (savedSidebarWidth > 240) {
        savedSidebarWidth = 200;
      } else {
        savedSidebarWidth = 320;
      }
      glossarySidebar.style.width = savedSidebarWidth + 'px';
      localStorage.setItem('glossarySidebarWidth', savedSidebarWidth);
      window.pdfViewer?.zoomFitWidth();
    });
  }

  // Restore initial state (collapse by default on iPad/touch devices so PDF gets 100% width; keep open on PC desktop unless collapsed)
  const isStoredCollapsed = localStorage.getItem('glossarySidebarCollapsed');
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 1024);
  if (isStoredCollapsed === 'true' || (isStoredCollapsed === null && isTouchDevice)) {
    updateSidebarState(true);
  } else {
    updateSidebarState(false);
  }

  // Vocab Drawer
  document.getElementById('btn-toggle-vocab')?.addEventListener('click', () => {
    renderVocabDrawerItems(window.vocabularyManager.getWords());
    vocabDrawer.classList.toggle('open');
  });

  document.getElementById('btn-close-vocab')?.addEventListener('click', () => {
    vocabDrawer.classList.remove('open');
  });

  function renderVocabDrawerItems(list) {
    const container = document.getElementById('vocab-list-items');
    const badge = document.getElementById('vocab-count');
    if (badge) badge.textContent = list.length;
    if (!container) return;

    if (!list || list.length === 0) {
      container.innerHTML = `
        <div class="glossary-empty">
          <i data-lucide="book-open"></i>
          <p>Your saved vocabulary deck is empty.<br>Tap or highlight words in the PDF to build your deck.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    let html = '';
    list.forEach(v => {
      const gBadge = v.gender ? `<span class="badge ${v.gender.includes('die') ? 'badge-die' : (v.gender.includes('der') ? 'badge-der' : 'badge-das')}">${escapeHtml(v.gender)}</span>` : '';
      const posBadge = v.pos ? `<span class="badge ${v.pos.includes('verb') ? 'badge-verb' : 'badge-adj'}">${escapeHtml(v.pos)}</span>` : '';

      html += `
        <div class="gloss-card-modern" data-vocab-id="${v.id}">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div style="display:flex; flex-direction:column;">
              <span class="gloss-word-title" style="font-size:16px;">${escapeHtml(v.german)}</span>
              <div style="display:flex; gap:4px; margin-top:3px;">
                ${gBadge}
                ${posBadge}
              </div>
            </div>
            <div style="display:flex; gap:4px;">
              <button class="icon-btn-tiny vocab-tts-btn" data-word="${escapeHtml(v.german)}" title="Pronounce Audio"><i data-lucide="volume-2"></i></button>
              <button class="icon-btn-tiny danger vocab-del-btn" data-id="${v.id}" title="Remove Word">&times;</button>
            </div>
          </div>
          <div style="font-size:13.5px; color:var(--text-secondary); margin-top:6px; font-weight:500;">
            ${escapeHtml(v.english)}
          </div>
          <div style="font-size:10.5px; color:var(--text-muted); margin-top:4px;">
            Page ${v.pageNum || 1} • Encountered ${v.count || 1}×
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();

    container.querySelectorAll('.vocab-tts-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const word = btn.getAttribute('data-word');
        if (window.germanSpeech && word) window.germanSpeech.speak(word);
      });
    });

    container.querySelectorAll('.vocab-del-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        if (id) window.vocabularyManager.removeWord(id);
      });
    });
  }

  window.vocabularyManager.subscribe((list) => {
    renderVocabDrawerItems(list);
  });
  renderVocabDrawerItems(window.vocabularyManager.getWords());

  // Theme Toggle
  document.getElementById('btn-toggle-theme')?.addEventListener('click', () => {
    activeTheme = activeTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', activeTheme);
    localStorage.setItem('theme', activeTheme);
    updateThemeIcon();
  });

  function updateThemeIcon() {
    const themeBtn = document.getElementById('btn-toggle-theme');
    if (!themeBtn) return;
    themeBtn.innerHTML = activeTheme === 'light' ? '<i data-lucide="moon"></i>' : '<i data-lucide="sun"></i>';
    if (window.lucide) window.lucide.createIcons();
  }

  // Obsidian Sync Modal Controller
  const obsidianModal = document.getElementById('obsidian-modal');
  const vaultNameInput = document.getElementById('obsidian-vault-name-input');
  
  if (vaultNameInput) {
    const savedVaultName = localStorage.getItem('obsidian_vault_name') || 'Obsidian Vault';
    vaultNameInput.value = savedVaultName;
    vaultNameInput.addEventListener('change', (e) => {
      localStorage.setItem('obsidian_vault_name', e.target.value.trim());
    });
  }

  function openObsidianModal() {
    if (!obsidianModal) return;
    const vocabList = window.vocabularyManager.getWords();
    if (vocabList.length === 0) {
      showToast('Highlight words to sync to Obsidian');
      return;
    }
    obsidianModal.classList.add('visible');
  }

  function closeObsidianModal() {
    if (obsidianModal) obsidianModal.classList.remove('visible');
  }

  document.getElementById('btn-save-obsidian')?.addEventListener('click', openObsidianModal);
  document.getElementById('btn-drawer-obsidian')?.addEventListener('click', openObsidianModal);
  document.getElementById('btn-close-obsidian-modal')?.addEventListener('click', closeObsidianModal);

  // 1. iPad Native App Sync
  document.getElementById('btn-sync-ipad-app')?.addEventListener('click', () => {
    const podcastTitle = document.getElementById('podcast-title-input')?.value.trim() || 'German Podcast';
    const vaultName = vaultNameInput?.value.trim() || 'Obsidian Vault';
    closeObsidianModal();
    window.vocabularyManager.openInObsidianApp(podcastTitle, vaultName);
    showToast(`Opening Obsidian iPad App for "${podcastTitle}"...`);
  });

  // 2. Self-Hosted Server Sync
  document.getElementById('btn-sync-server-api')?.addEventListener('click', async () => {
    const podcastTitle = document.getElementById('podcast-title-input')?.value.trim() || 'German Podcast';
    closeObsidianModal();
    showToast('Syncing to host Obsidian vault...');
    const res = await window.vocabularyManager.saveToObsidianServer(podcastTitle);
    if (res.status === 'success') {
      showToast(`✓ Saved ${res.count} words to ${res.filePath}`);
    } else {
      showToast(`Server sync notice: ${res.message || 'Falling back to download'}`);
      window.vocabularyManager.exportObsidianMarkdown(podcastTitle);
    }
  });

  // 3. Download Markdown (.md)
  document.getElementById('btn-sync-download-md')?.addEventListener('click', () => {
    const podcastTitle = document.getElementById('podcast-title-input')?.value.trim() || 'German Podcast';
    closeObsidianModal();
    window.vocabularyManager.exportObsidianMarkdown(podcastTitle);
    showToast(`✓ Generated ${podcastTitle}_vocabulary.md`);
  });

  // Anki TSV and CSV Exports
  document.getElementById('btn-export-anki')?.addEventListener('click', () => {
    window.vocabularyManager.exportAnki();
    showToast('✓ Exported wortschatz_anki_deck.tsv');
  });

  document.getElementById('btn-export-csv')?.addEventListener('click', () => {
    window.vocabularyManager.exportCSV();
    showToast('✓ Exported german_vocabulary.csv');
  });

  // Flashcards Modal
  const flashcardModal = document.getElementById('flashcard-modal');
  let currentCardIndex = 0;

  document.getElementById('btn-practice-flashcards')?.addEventListener('click', () => {
    const words = window.vocabularyManager.getWords();
    if (words.length === 0) {
      alert('Highlight some German words first to practice flashcards!');
      return;
    }
    currentCardIndex = 0;
    showFlashcard(currentCardIndex);
    flashcardModal.classList.add('visible');
  });

  document.getElementById('btn-close-flashcards')?.addEventListener('click', () => {
    flashcardModal.classList.remove('visible');
  });

  function showFlashcard(index) {
    const words = window.vocabularyManager.getWords();
    if (words.length === 0) return;
    const w = words[index];

    document.getElementById('card-index').textContent = `${index + 1} / ${words.length}`;
    document.getElementById('card-german').textContent = w.german;
    document.getElementById('card-english').textContent = w.english;

    const gBadge = document.getElementById('card-gender');
    if (w.gender) {
      gBadge.style.display = 'inline-block';
      gBadge.textContent = w.gender;
      gBadge.className = 'badge ' + (w.gender.includes('die') ? 'badge-die' : (w.gender.includes('der') ? 'badge-der' : 'badge-das'));
    } else {
      gBadge.style.display = 'none';
    }

    const posBadge = document.getElementById('card-pos');
    if (w.pos) {
      posBadge.style.display = 'inline-block';
      posBadge.textContent = w.pos;
      posBadge.className = 'badge ' + (w.pos.includes('verb') ? 'badge-verb' : 'badge-adj');
    } else {
      posBadge.style.display = 'none';
    }

    const inner = document.getElementById('flashcard-inner');
    inner.querySelector('.card-front').style.display = 'flex';
    inner.querySelector('.card-back').style.display = 'none';
  }

  document.getElementById('flashcard-inner')?.addEventListener('click', () => {
    const inner = document.getElementById('flashcard-inner');
    const front = inner.querySelector('.card-front');
    const back = inner.querySelector('.card-back');
    if (front.style.display !== 'none') {
      front.style.display = 'none';
      back.style.display = 'flex';
    } else {
      front.style.display = 'flex';
      back.style.display = 'none';
    }
  });

  document.getElementById('btn-card-prev')?.addEventListener('click', () => {
    const words = window.vocabularyManager.getWords();
    if (words.length === 0) return;
    currentCardIndex = (currentCardIndex - 1 + words.length) % words.length;
    showFlashcard(currentCardIndex);
  });

  document.getElementById('btn-card-next')?.addEventListener('click', () => {
    const words = window.vocabularyManager.getWords();
    if (words.length === 0) return;
    currentCardIndex = (currentCardIndex + 1) % words.length;
    showFlashcard(currentCardIndex);
  });

  document.getElementById('btn-card-audio')?.addEventListener('click', () => {
    const words = window.vocabularyManager.getWords();
    if (words.length > 0 && words[currentCardIndex]) {
      window.germanSpeech.speak(words[currentCardIndex].german);
    }
  });

  // Auto-resize PDF canvas on window resize / iPad orientation change
  window.addEventListener('resize', () => {
    window.pdfViewer.zoomFitWidth();
  });

  // Load sample on initial boot
  if (window.SAMPLE_GERMAN_PDF_BASE64) {
    window.pdfViewer.loadDocument(window.SAMPLE_GERMAN_PDF_BASE64);
  }

  // Glossary Sidebar Filter & Search
  const tabAll = document.getElementById('tab-filter-all');
  const tabCurPage = document.getElementById('tab-filter-page');
  const inputSearch = document.getElementById('input-gloss-search');

  tabAll?.addEventListener('click', () => {
    tabAll.classList.add('active');
    tabCurPage?.classList.remove('active');
    window.pdfAnnotator.setFilterMode('all');
  });

  tabCurPage?.addEventListener('click', () => {
    tabCurPage.classList.add('active');
    tabAll?.classList.remove('active');
    window.pdfAnnotator.setFilterMode('currentPage');
  });

  inputSearch?.addEventListener('input', (e) => {
    window.pdfAnnotator.setSearchQuery(e.target.value);
  });

});