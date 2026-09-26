// High-Performance Virtual PDF.js Viewer Engine (Extreme Condition & iPad Air M3 Optimized)
class PDFViewerController {
  constructor() {
    this.pdfDoc = null;
    this.currentScale = 1.2;
    this.currentPage = 1;
    this.totalPages = 0;
    this.container = document.getElementById('pdf-viewer-container');
    this.selectionCallback = null;
    this.isAutoAnnotateEnabled = true;
    this.renderedPages = new Set();
    this.renderingQueue = new Set();
    this.intersectionObserver = null;
    this.pageDimensions = { width: 800, height: 1100 };
    this.maxActivePages = 14; // Memory conservation for iPad Safari WebKit

    if (window.pdfjsLib) {
      if (window.PDF_WORKER_CODE) {
        const blob = new Blob([window.PDF_WORKER_CODE], { type: 'application/javascript' });
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(blob);
      } else {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.min.js';
      }
    }
  }

  onSelection(callback) {
    this.selectionCallback = callback;
  }

  base64ToUint8Array(base64) {
    const raw = window.atob(base64);
    const rawLength = raw.length;
    const array = new Uint8Array(new ArrayBuffer(rawLength));
    for (let i = 0; i < rawLength; i++) {
      array[i] = raw.charCodeAt(i);
    }
    return array;
  }

  async loadDocument(source, originalBuffer = null) {
    try {
      this.container.innerHTML = '<div class="pdf-loading"><div class="spinner"></div><p>Opening German Document...</p></div>';
      
      let loadingTask;
      let arrayBufferToStore = null;

      if (source instanceof ArrayBuffer || (source && source.byteLength !== undefined)) {
        const u8 = new Uint8Array(source);
        arrayBufferToStore = source.slice ? source.slice(0) : u8.buffer;
        loadingTask = window.pdfjsLib.getDocument({ data: u8 });
      } else if (source instanceof Uint8Array) {
        arrayBufferToStore = source.buffer.slice(0);
        loadingTask = window.pdfjsLib.getDocument({ data: source });
      } else if (typeof source === 'string') {
        if (source.startsWith('data:') || source.length > 500) {
          const b64Data = source.includes(',') ? source.split(',')[1] : source;
          const u8 = this.base64ToUint8Array(b64Data);
          arrayBufferToStore = u8.buffer;
          loadingTask = window.pdfjsLib.getDocument({ data: u8 });
        } else {
          try {
            const response = await fetch(source);
            const ab = await response.arrayBuffer();
            arrayBufferToStore = ab;
            loadingTask = window.pdfjsLib.getDocument({ data: new Uint8Array(ab) });
          } catch (fetchErr) {
            if (window.SAMPLE_GERMAN_PDF_BASE64) {
              const u8 = this.base64ToUint8Array(window.SAMPLE_GERMAN_PDF_BASE64);
              arrayBufferToStore = u8.buffer;
              loadingTask = window.pdfjsLib.getDocument({ data: u8 });
            } else {
              throw fetchErr;
            }
          }
        }
      }

      this.pdfDoc = await loadingTask.promise;
      this.totalPages = this.pdfDoc.numPages;
      this.currentPage = 1;
      this.renderedPages.clear();
      this.renderingQueue.clear();
      
      window.pdfAnnotator.setOriginalPdfBytes(originalBuffer || arrayBufferToStore);
      const docIdentifier = typeof source === 'string' && source.length < 200 ? source : (window._currentDocName || 'german_document');
      window.pdfAnnotator.setDocumentKey(docIdentifier);

      const firstPage = await this.pdfDoc.getPage(1);
      const firstVp = firstPage.getViewport({ scale: 1.0 });
      this.pageDimensions = { width: firstVp.width, height: firstVp.height };

      // Calculate initial auto-fit scale
      this.calculateFitScale();

      this.setupPagePlaceholders();
      this.setupIntersectionObserver();

      document.getElementById('total-pages').textContent = this.totalPages;
      document.getElementById('current-page-input').value = this.currentPage;
      document.getElementById('current-page-input').max = this.totalPages;
      document.getElementById('zoom-percentage').textContent = `${Math.round(this.currentScale * 100)}%`;

      await this.renderSinglePage(1);

      this.setupTextSelectionListener();
      this.setupTouchPinchZoom();
      return true;
    } catch (err) {
      console.error('Error loading PDF:', err);
      this.container.innerHTML = `<div class="pdf-error"><p>Failed to load PDF: ${err.message}</p></div>`;
      return false;
    }
  }

  calculateFitScale() {
    if (!this.container) return;
    const availableWidth = this.container.clientWidth - 40;
    if (availableWidth > 260 && this.pageDimensions.width > 0) {
      this.currentScale = Math.max(0.6, Math.min(2.2, availableWidth / this.pageDimensions.width));
    }
  }

  setupPagePlaceholders() {
    this.container.innerHTML = '';
    const scaledWidth = Math.floor(this.pageDimensions.width * this.currentScale);
    const scaledHeight = Math.floor(this.pageDimensions.height * this.currentScale);

    for (let pageNum = 1; pageNum <= this.totalPages; pageNum++) {
      const pageWrapper = document.createElement('div');
      pageWrapper.className = 'page';
      pageWrapper.setAttribute('data-page-number', pageNum);
      pageWrapper.id = `pdf-page-${pageNum}`;
      pageWrapper.style.width = `${scaledWidth}px`;
      pageWrapper.style.minHeight = `${scaledHeight}px`;

      const canvas = document.createElement('canvas');
      const textLayer = document.createElement('div');
      textLayer.className = 'textLayer';

      const customLayer = document.createElement('div');
      customLayer.className = 'annotation-layer-custom';

      pageWrapper.appendChild(canvas);
      pageWrapper.appendChild(textLayer);
      pageWrapper.appendChild(customLayer);
      this.container.appendChild(pageWrapper);
    }
  }

  setupIntersectionObserver() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }

    const options = {
      root: this.container,
      rootMargin: '400px 0px 400px 0px',
      threshold: 0.01
    };

    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const pageNum = parseInt(entry.target.getAttribute('data-page-number'), 10);
        if (entry.isIntersecting) {
          if (!this.renderedPages.has(pageNum) && !this.renderingQueue.has(pageNum)) {
            this.renderSinglePage(pageNum);
          }
          if (entry.intersectionRatio > 0.4) {
            this.currentPage = pageNum;
            const input = document.getElementById('current-page-input');
            if (input && document.activeElement !== input) {
              input.value = pageNum;
            }
          }
        } else {
          // Virtual canvas memory conservation for iPadOS WebKit stability in 100+ page PDFs
          if (this.renderedPages.size > this.maxActivePages && Math.abs(pageNum - this.currentPage) > 4) {
            const canvas = entry.target.querySelector('canvas');
            const textLayer = entry.target.querySelector('.textLayer');
            if (canvas && textLayer && this.renderedPages.has(pageNum)) {
              canvas.width = 1;
              canvas.height = 1;
              textLayer.innerHTML = '';
              this.renderedPages.delete(pageNum);
            }
          }
        }
      });
    }, options);

    document.querySelectorAll('.page').forEach(pageEl => {
      this.intersectionObserver.observe(pageEl);
    });
  }

  async renderSinglePage(pageNum) {
    if (pageNum < 1 || pageNum > this.totalPages) return;
    if (this.renderingQueue.has(pageNum)) return;

    this.renderingQueue.add(pageNum);
    try {
      const pageWrapper = document.getElementById(`pdf-page-${pageNum}`);
      if (!pageWrapper) return;

      const canvas = pageWrapper.querySelector('canvas');
      const textLayer = pageWrapper.querySelector('.textLayer');
      if (!canvas || !textLayer) return;

      const page = await this.pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: this.currentScale });

      // iPad Retina display scaling (capped at 2.0 to balance crystal clarity and memory)
      const outputScale = Math.min(window.devicePixelRatio || 1, 2.0);
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = Math.floor(viewport.width) + 'px';
      canvas.style.height = Math.floor(viewport.height) + 'px';

      pageWrapper.style.width = Math.floor(viewport.width) + 'px';
      pageWrapper.style.minHeight = Math.floor(viewport.height) + 'px';

      const ctx = canvas.getContext('2d');
      const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

      await page.render({
        canvasContext: ctx,
        transform: transform,
        viewport: viewport
      }).promise;

      textLayer.innerHTML = '';
      textLayer.style.width = Math.floor(viewport.width) + 'px';
      textLayer.style.height = Math.floor(viewport.height) + 'px';
      textLayer.style.setProperty('--scale-factor', this.currentScale);

      const textContent = await page.getTextContent();
      await window.pdfjsLib.renderTextLayer({
        textContentSource: textContent,
        container: textLayer,
        viewport: viewport,
        textDivs: []
      }).promise;

      this.renderedPages.add(pageNum);
      window.pdfAnnotator.redrawPageAnnotations(pageNum, viewport);
    } catch (e) {
      console.warn(`Page ${pageNum} render deferred:`, e);
    } finally {
      this.renderingQueue.delete(pageNum);
    }
  }

  findTextSpanAtPoint(clientX, clientY, directTarget = null) {
    if (directTarget) {
      const span = directTarget.closest ? directTarget.closest('.textLayer > span') : null;
      if (span) return span;
    }

    // Direct element from point
    const directEl = document.elementFromPoint(clientX, clientY);
    if (directEl) {
      const s = directEl.closest('.textLayer > span');
      if (s) return s;
    }

    // Check surrounding deltas (helpful for iPad finger & Apple Pencil taps)
    const deltas = [[0, -4], [0, 4], [-4, 0], [4, 0], [-8, 0], [8, 0], [0, -8], [0, 8]];
    for (const [dx, dy] of deltas) {
      const el = document.elementFromPoint(clientX + dx, clientY + dy);
      if (el) {
        const s = el.closest('.textLayer > span');
        if (s) return s;
      }
    }

    // Page-level geometric search (guarantees hit even if tap lands on canvas or between lines)
    const pageEl = (directTarget && directTarget.closest) ? directTarget.closest('.page') : (directEl ? directEl.closest('.page') : null);
    if (!pageEl) return null;

    const spans = Array.from(pageEl.querySelectorAll('.textLayer > span'));
    if (spans.length === 0) return null;

    // Check bounding rect with 4px margin
    for (const s of spans) {
      const r = s.getBoundingClientRect();
      if (clientX >= r.left - 4 && clientX <= r.right + 4 && clientY >= r.top - 4 && clientY <= r.bottom + 4) {
        return s;
      }
    }

    // Minimum distance fallback within 36px
    let closestSpan = null;
    let minDistance = 36;
    for (const s of spans) {
      const r = s.getBoundingClientRect();
      const centerX = r.left + r.width / 2;
      const centerY = r.top + r.height / 2;
      const dist = Math.hypot(clientX - centerX, clientY - centerY);
      if (dist < minDistance) {
        minDistance = dist;
        closestSpan = s;
      }
    }
    return closestSpan;
  }

  getWordRangeAtPoint(clientX, clientY, directTarget = null) {
    const isWordChar = (ch) => /[a-zA-Z0-9äöüÄÖÜß\-]/.test(ch);

    const span = this.findTextSpanAtPoint(clientX, clientY, directTarget);
    if (!span || !span.firstChild || span.firstChild.nodeType !== 3) {
      return null;
    }

    const targetTextNode = span.firstChild;
    const text = targetTextNode.textContent;
    if (!text || text.length === 0) return null;

    const rect = span.getBoundingClientRect();
    const ratio = rect.width > 0 ? Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) : 0;
    let targetOffset = Math.min(text.length, Math.max(0, Math.round(ratio * text.length)));

    // Boundary adjustment
    if (targetOffset < text.length && !isWordChar(text[targetOffset])) {
      if (targetOffset > 0 && isWordChar(text[targetOffset - 1])) {
        targetOffset = targetOffset - 1;
      } else if (targetOffset + 1 < text.length && isWordChar(text[targetOffset + 1])) {
        targetOffset = targetOffset + 1;
      }
    } else if (targetOffset === text.length && targetOffset > 0 && isWordChar(text[targetOffset - 1])) {
      targetOffset = targetOffset - 1;
    }

    if (targetOffset < 0 || targetOffset >= text.length || !isWordChar(text[targetOffset])) {
      return null;
    }

    // Expand within span
    let startSpan = span;
    let startNode = targetTextNode;
    let startOffset = targetOffset;
    while (startOffset > 0 && isWordChar(text[startOffset - 1])) {
      startOffset--;
    }

    let endSpan = span;
    let endNode = targetTextNode;
    let endOffset = targetOffset;
    while (endOffset < text.length && isWordChar(text[endOffset])) {
      endOffset++;
    }

    // Cross-span backward expansion (German compound words or broken spans)
    while (startOffset === 0) {
      const prevSpan = startSpan.previousElementSibling;
      if (!prevSpan || !prevSpan.matches('.textLayer > span')) break;
      const prevNode = prevSpan.firstChild;
      if (!prevNode || prevNode.nodeType !== 3) break;
      const prevText = prevNode.textContent;
      if (!prevText || prevText.length === 0) break;

      const lastChar = prevText[prevText.length - 1];
      if (!isWordChar(lastChar)) break;

      const rCurr = startSpan.getBoundingClientRect();
      const rPrev = prevSpan.getBoundingClientRect();
      if (Math.abs(rCurr.top - rPrev.top) > rCurr.height * 0.8) break;

      startSpan = prevSpan;
      startNode = prevNode;
      let pOffset = prevText.length - 1;
      while (pOffset > 0 && isWordChar(prevText[pOffset - 1])) {
        pOffset--;
      }
      startOffset = pOffset;
      if (pOffset > 0) break;
    }

    // Cross-span forward expansion
    while (endOffset === endNode.textContent.length) {
      const nextSpan = endSpan.nextElementSibling;
      if (!nextSpan || !nextSpan.matches('.textLayer > span')) break;
      const nextNode = nextSpan.firstChild;
      if (!nextNode || nextNode.nodeType !== 3) break;
      const nextText = nextNode.textContent;
      if (!nextText || nextText.length === 0) break;

      const firstChar = nextText[0];
      if (!isWordChar(firstChar)) break;

      const rCurr = endSpan.getBoundingClientRect();
      const rNext = nextSpan.getBoundingClientRect();
      if (Math.abs(rCurr.top - rNext.top) > rCurr.height * 0.8) break;

      endSpan = nextSpan;
      endNode = nextNode;
      let nOffset = 0;
      while (nOffset < nextText.length && isWordChar(nextText[nOffset])) {
        nOffset++;
      }
      endOffset = nOffset;
      if (nOffset < nextText.length) break;
    }

    if (startNode === endNode && startOffset === endOffset) return null;

    try {
      const wordRange = document.createRange();
      wordRange.setStart(startNode, startOffset);
      wordRange.setEnd(endNode, endOffset);

      let wordStr = wordRange.toString().trim();
      while (wordStr.startsWith('-') || wordStr.startsWith('—')) {
        startOffset++;
        wordRange.setStart(startNode, startOffset);
        wordStr = wordRange.toString().trim();
      }
      while (wordStr.endsWith('-') || wordStr.endsWith('—')) {
        endOffset--;
        wordRange.setEnd(endNode, endOffset);
        wordStr = wordRange.toString().trim();
      }

      if (!wordStr || wordStr.length === 0) return null;

      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(wordRange);
      }
      return wordRange;
    } catch (e) {
      console.warn('Error creating word range:', e);
      return null;
    }
  }

  expandSelectionToSentence(pageEl, targetNode) {
    const textSpans = Array.from(pageEl.querySelectorAll('.textLayer > span'));
    if (textSpans.length === 0) return null;

    const targetSpan = (targetNode.nodeType === 3 ? targetNode.parentElement : targetNode).closest('.textLayer > span');
    const targetIndex = textSpans.indexOf(targetSpan);
    if (targetIndex === -1) return null;

    let startIndex = targetIndex;
    let startOffset = 0;
    for (let i = targetIndex; i >= 0; i--) {
      const text = textSpans[i].textContent;
      const lastPunct = Math.max(text.lastIndexOf('.'), text.lastIndexOf('!'), text.lastIndexOf('?'));
      if (lastPunct !== -1 && i < targetIndex) {
        startIndex = i;
        startOffset = lastPunct + 1;
        break;
      }
      if (i === 0) {
        startIndex = 0;
        startOffset = 0;
      }
    }

    let endIndex = targetIndex;
    let endOffset = textSpans[targetIndex].textContent.length;
    for (let i = targetIndex; i < textSpans.length; i++) {
      const text = textSpans[i].textContent;
      const matches = [...text.matchAll(/[.!?]/g)];
      if (matches.length > 0) {
        endIndex = i;
        endOffset = matches[0].index + 1;
        break;
      }
      if (i === textSpans.length - 1) {
        endIndex = i;
        endOffset = text.length;
      }
    }

    try {
      const range = document.createRange();
      const startTextNode = textSpans[startIndex].firstChild || textSpans[startIndex];
      const endTextNode = textSpans[endIndex].firstChild || textSpans[endIndex];

      const safeStartOffset = Math.min(startOffset, startTextNode.textContent ? startTextNode.textContent.length : 0);
      const safeEndOffset = Math.min(endOffset, endTextNode.textContent ? endTextNode.textContent.length : 0);

      range.setStart(startTextNode, safeStartOffset);
      range.setEnd(endTextNode, safeEndOffset);

      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      return range;
    } catch (err) {
      return null;
    }
  }

  setupTextSelectionListener() {
    if (this._selectionListenersInitialized) return;
    this._selectionListenersInitialized = true;
    let lastHandledTime = 0;
    let tapCount = 0;
    let tapTimer = null;
    let longPressTimer = null;

    const processCurrentSelection = async (e, customRange = null, customType = 'word') => {
      if (window.pdfAnnotator.isEraserMode) return;
      if (e && e.target && (e.target.closest('#translation-popup') || e.target.closest('.gloss-card-modern') || e.target.closest('.glossary-sidebar') || e.target.closest('.bottom-tools-island') || e.target.closest('.modal-card'))) {
        return;
      }

      const selection = window.getSelection();
      let range = customRange || (selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null);
      if (!range) return;

      const rawSelectedText = (customRange ? customRange.toString() : (range ? range.toString() : selection.toString())).trim();
      // Remove soft hyphens and normalize German text
      const selectedText = rawSelectedText.replace(/\u00AD/g, '').replace(/(\w+)-\s*\n\s*(\w+)/g, '$1$2').trim();
      if (!selectedText || selectedText.length < 1) {
        if (window.dismissTranslationPopup) window.dismissTranslationPopup();
        return;
      }

      const nodeForPage = customRange ? (customRange.startContainer.nodeType === 3 ? customRange.startContainer.parentElement : customRange.startContainer) : (selection.anchorNode ? (selection.anchorNode.nodeType === 3 ? selection.anchorNode.parentElement : selection.anchorNode) : null);
      const pageEl = nodeForPage ? nodeForPage.closest('.page') : (e && e.target ? e.target.closest('.page') : null);
      if (!pageEl) return;

      const pageNum = parseInt(pageEl.getAttribute('data-page-number'), 10);
      let clientRects = Array.from(range.getClientRects()).filter(r => r.width > 1 && r.height > 1);
      if (clientRects.length === 0) {
        const b = range.getBoundingClientRect();
        if (b && (b.width > 1 || b.height > 1)) {
          clientRects = [b];
        } else if (pageEl) {
          const directEl = (e && e.target && e.target.getBoundingClientRect) ? e.target : pageEl;
          clientRects = [directEl.getBoundingClientRect()];
        }
      }
      if (clientRects.length === 0) return;

      const pageBox = pageEl.getBoundingClientRect();
      const page = await this.pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: this.currentScale });

      const domRects = clientRects.map(cr => ({
        x: cr.left - pageBox.left,
        y: cr.top - pageBox.top,
        width: cr.width,
        height: cr.height
      }));

      const pdfRects = domRects.map(dr => {
        const p1 = viewport.convertToPdfPoint(dr.x, dr.y);
        const p2 = viewport.convertToPdfPoint(dr.x + dr.width, dr.y + dr.height);
        const minX = Math.min(p1[0], p2[0]);
        const minY = Math.min(p1[1], p2[1]);
        const w = Math.abs(p2[0] - p1[0]);
        const h = Math.abs(p2[1] - p1[1]);
        return { x: minX, y: minY, width: w, height: h };
      });

      const firstRect = clientRects[0];
      const popupPos = {
        x: firstRect.left + (firstRect.width / 2),
        y: firstRect.top - 8,
        bottomY: firstRect.bottom + 8
      };

      if (this.selectionCallback) {
        this.selectionCallback({
          text: selectedText,
          type: customType,
          pageNum,
          domRects,
          pdfRects,
          popupPos
        });
      }
    };

    // Pointer Events for Apple Pencil & Touch Gestures
    let pointerStartX = 0;
    let pointerStartY = 0;
    let pointerStartTime = 0;
    let isPointerDown = false;

    const onPointerDown = (e) => {
      if (e.isPrimary === false) return;
      isPointerDown = true;
      pointerStartX = e.clientX;
      pointerStartY = e.clientY;
      pointerStartTime = Date.now();

      // Long-press detection on touch devices: expand to sentence
      if (longPressTimer) clearTimeout(longPressTimer);
      if (e.pointerType === 'touch' || e.pointerType === 'pen') {
        longPressTimer = setTimeout(() => {
          if (isPointerDown) {
            const targetSpan = this.findTextSpanAtPoint(pointerStartX, pointerStartY, e.target);
            const pageEl = (e.target && e.target.closest) ? e.target.closest('.page') : (targetSpan ? targetSpan.closest('.page') : null);
            if (pageEl && targetSpan) {
              const sentenceRange = this.expandSelectionToSentence(pageEl, targetSpan);
              if (sentenceRange) {
                lastHandledTime = Date.now();
                processCurrentSelection(e, sentenceRange, 'sentence');
              }
            }
          }
        }, 550);
      }
    };

    const onPointerUp = (e) => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      if (!isPointerDown) return;
      isPointerDown = false;

      const distX = Math.abs(e.clientX - pointerStartX);
      const distY = Math.abs(e.clientY - pointerStartY);
      const duration = Date.now() - pointerStartTime;

      const isPen = e.pointerType === 'pen';
      const isTouch = e.pointerType === 'touch';

      const maxDist = isPen ? 16 : (isTouch ? 22 : 12);
      const isTap = distX <= maxDist && distY <= maxDist && duration < 500;

      if (isTap) {
        tapCount++;
        if (tapTimer) clearTimeout(tapTimer);

        tapTimer = setTimeout(() => {
          const clicks = tapCount;
          tapCount = 0;

          if (clicks === 1) {
            // 1 TOUCH / CLICK with Hand or Apple Pencil: SELECT WORD
            const wordRange = this.getWordRangeAtPoint(e.clientX, e.clientY, e.target);
            if (wordRange) {
              lastHandledTime = Date.now();
              processCurrentSelection(e, wordRange, 'word');
            }
          } else if (clicks >= 2) {
            // 2 TOUCHES / DOUBLE CLICK with Hand or Apple Pencil: SELECT FULL SENTENCE
            const targetSpan = this.findTextSpanAtPoint(e.clientX, e.clientY, e.target);
            const pageEl = (e.target && e.target.closest) ? e.target.closest('.page') : (targetSpan ? targetSpan.closest('.page') : null);
            if (pageEl && targetSpan) {
              const sentenceRange = this.expandSelectionToSentence(pageEl, targetSpan);
              if (sentenceRange) {
                lastHandledTime = Date.now();
                processCurrentSelection(e, sentenceRange, 'sentence');
                return;
              }
            }
            // Fallback to word
            const wordRange = this.getWordRangeAtPoint(e.clientX, e.clientY, e.target);
            if (wordRange) {
              lastHandledTime = Date.now();
              processCurrentSelection(e, wordRange, 'word');
            }
          }
        }, 300);
        return;
      }

      // Drag selection check
      setTimeout(() => {
        if (Date.now() - lastHandledTime < 400) return;
        const sel = window.getSelection();
        if (sel && sel.toString().trim().length > 0) {
          lastHandledTime = Date.now();
          processCurrentSelection(e, null, 'manual');
        }
      }, 50);
    };

    if (window.PointerEvent) {
      this.container.addEventListener('pointerdown', onPointerDown, { passive: true });
      this.container.addEventListener('pointerup', onPointerUp, { passive: true });
      this.container.addEventListener('pointercancel', () => { 
        isPointerDown = false;
        if (longPressTimer) clearTimeout(longPressTimer);
      }, { passive: true });
    }

    // Mouse fallback
    const handleMouseUp = (e) => {
      if (Date.now() - lastHandledTime < 400) return;
      const clickCount = e.detail || 1;
      if (clickCount >= 2) {
        // Double click: full sentence selection
        const targetSpan = this.findTextSpanAtPoint(e.clientX, e.clientY, e.target);
        const pageEl = (e.target && e.target.closest) ? e.target.closest('.page') : (targetSpan ? targetSpan.closest('.page') : null);
        if (pageEl && targetSpan) {
          const sentenceRange = this.expandSelectionToSentence(pageEl, targetSpan);
          if (sentenceRange) {
            lastHandledTime = Date.now();
            processCurrentSelection(e, sentenceRange, 'sentence');
            return;
          }
        }
      }
      setTimeout(() => {
        if (Date.now() - lastHandledTime < 400) return;
        const sel = window.getSelection();
        if (sel && sel.toString().trim().length > 0) {
          processCurrentSelection(e, null, 'manual');
        }
      }, 40);
    };

    this.container.removeEventListener('mouseup', this._selectionHandler);
    this._selectionHandler = handleMouseUp;
    this.container.addEventListener('mouseup', handleMouseUp);
  }

  // Smooth Two-Finger Touch Pinch-To-Zoom (iPad Air M3 Touchscreen)
  setupTouchPinchZoom() {
    if (this._pinchListenersInitialized) return;
    this._pinchListenersInitialized = true;
    let initialDistance = 0;
    let initialScale = this.currentScale;
    let isPinching = false;

    const getDistance = (touches) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    this.container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        isPinching = true;
        initialDistance = getDistance(e.touches);
        initialScale = this.currentScale;
      }
    }, { passive: true });

    this.container.addEventListener('touchmove', (e) => {
      if (isPinching && e.touches.length === 2) {
        const currentDist = getDistance(e.touches);
        const ratio = currentDist / initialDistance;
        const newScale = Math.max(0.6, Math.min(2.5, initialScale * ratio));
        document.getElementById('zoom-percentage').textContent = `${Math.round(newScale * 100)}%`;
      }
    }, { passive: true });

    this.container.addEventListener('touchend', (e) => {
      if (isPinching && e.touches.length < 2) {
        isPinching = false;
        const currentText = document.getElementById('zoom-percentage').textContent;
        const parsedScale = parseInt(currentText, 10) / 100;
        if (!isNaN(parsedScale) && Math.abs(parsedScale - this.currentScale) > 0.05) {
          this.setZoom(parsedScale);
        }
      }
    }, { passive: true });
  }

  async setZoom(scale) {
    this.currentScale = Math.max(0.5, Math.min(3.0, scale));
    document.getElementById('zoom-percentage').textContent = `${Math.round(this.currentScale * 100)}%`;
    this.renderedPages.clear();
    this.setupPagePlaceholders();
    this.setupIntersectionObserver();
    await this.renderSinglePage(this.currentPage);
  }

  zoomIn() { this.setZoom(this.currentScale + 0.15); }
  zoomOut() { this.setZoom(this.currentScale - 0.15); }
  zoomFitWidth() {
    this.calculateFitScale();
    this.setZoom(this.currentScale);
  }

  goToPage(num) {
    if (num < 1 || num > this.totalPages) return;
    this.currentPage = num;
    document.getElementById('current-page-input').value = num;
    const targetPage = document.getElementById(`pdf-page-${num}`);
    if (targetPage) {
      targetPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

window.pdfViewer = new PDFViewerController();
