// Text-to-Speech Helper for German Pronunciation
class GermanSpeech {
  constructor() {
    this.synth = window.speechSynthesis;
    this.germanVoice = null;
    this.rate = 0.9; // Slightly slower for clear learner comprehension
    this.initVoices();
  }

  initVoices() {
    if (!this.synth) return;
    const findVoice = () => {
      const voices = this.synth.getVoices();
      this.germanVoice = voices.find(v => v.lang === 'de-DE' || v.lang.startsWith('de')) || null;
    };

    findVoice();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = findVoice;
    }
  }

  speak(text, speed = null) {
    if (!this.synth) {
      console.warn('Speech synthesis not supported in this browser.');
      return;
    }

    this.synth.cancel(); // Stop any previous speech
    const cleanText = text.replace(/[\[\]\(\)]/g, '').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'de-DE';
    if (this.germanVoice) {
      utterance.voice = this.germanVoice;
    }
    utterance.rate = speed || this.rate;
    utterance.pitch = 1.0;

    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth) this.synth.cancel();
  }
}

window.germanSpeech = new GermanSpeech();
