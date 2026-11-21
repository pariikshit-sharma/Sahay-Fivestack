import { TextToSpeechAdapter } from "./types";

export class WebSpeechSynthesisAdapter implements TextToSpeechAdapter {
  private voicesLoaded: boolean = false;
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      this.initVoices();
      if (typeof window.speechSynthesis.onvoiceschanged !== "undefined") {
        window.speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  private initVoices() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    this.cachedVoices = window.speechSynthesis.getVoices();
    if (this.cachedVoices.length > 0) {
      this.voicesLoaded = true;
    }
  }

  isSupported(): boolean {
    if (typeof window === "undefined") return false;
    return !!window.speechSynthesis;
  }

  getVoices(): SpeechSynthesisVoice[] {
    if (!this.isSupported()) return [];
    if (!this.voicesLoaded || this.cachedVoices.length === 0) {
      this.initVoices();
    }
    return this.cachedVoices.length > 0 ? this.cachedVoices : window.speechSynthesis.getVoices();
  }

  speak(
    text: string,
    bcp47Language: string,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ): void {
    if (!this.isSupported()) {
      if (onError) onError("Text to speech is not supported in this browser.");
      return;
    }

    try {
      // Chrome bug workaround: cancel must be followed by a tiny resume or tick
      window.speechSynthesis.cancel();

      // Fix Chrome garbage collection bug by keeping utterance in window scope during playback
      const utterance = new SpeechSynthesisUtterance(text);
      (window as any).__sahay_current_utterance__ = utterance;

      utterance.lang = bcp47Language;
      utterance.rate = 0.92; // Clear, measured pacing for government welfare guidance
      utterance.pitch = 1.0;

      const voices = this.getVoices();
      const langPrefix = bcp47Language.split("-")[0].toLowerCase();

      // 1. Exact match (e.g. hi-IN)
      // 2. Prefix match (e.g. hi)
      // 3. Indian English fallback if regional Indic voice isn't installed locally
      // 4. Default voice
      const exactVoice = voices.find((v) => v.lang.toLowerCase() === bcp47Language.toLowerCase());
      const prefixVoice = voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));
      const inEnglishVoice = voices.find((v) => v.lang.toLowerCase() === "en-in");
      const defaultVoice = voices.find((v) => v.default) || voices[0];

      utterance.voice = exactVoice || prefixVoice || inEnglishVoice || defaultVoice || null;

      utterance.onstart = () => {
        if (onStart) onStart();
      };

      utterance.onend = () => {
        (window as any).__sahay_current_utterance__ = null;
        if (onEnd) onEnd();
      };

      utterance.onerror = (err) => {
        // 'canceled' or 'interrupted' is expected when user clicks Stop or switches audio
        if (err.error === "canceled" || err.error === "interrupted") {
          (window as any).__sahay_current_utterance__ = null;
          if (onEnd) onEnd();
          return;
        }
        console.warn("[SAHAY TTS Error]:", err);
        (window as any).__sahay_current_utterance__ = null;
        if (onError) onError(err);
      };

      // Workaround for Chrome paused state bug
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("[SAHAY TTS Exception]:", err);
      if (onError) onError(err);
    }
  }

  stop(): void {
    if (this.isSupported()) {
      try {
        window.speechSynthesis.cancel();
        (window as any).__sahay_current_utterance__ = null;
      } catch {}
    }
  }
}

export const textToSpeechAdapter = new WebSpeechSynthesisAdapter();
