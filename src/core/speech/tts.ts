import { TextToSpeechAdapter } from "./types";

export class WebSpeechSynthesisAdapter implements TextToSpeechAdapter {
  private activeUtterance: SpeechSynthesisUtterance | null = null;

  isSupported(): boolean {
    if (typeof window === "undefined") return false;
    return "speechSynthesis" in window;
  }

  getVoices(): SpeechSynthesisVoice[] {
    if (!this.isSupported()) return [];
    return window.speechSynthesis.getVoices() || [];
  }

  speak(
    text: string,
    bcp47Language: string,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ): void {
    if (!this.isSupported()) {
      console.warn("[SAHAY TTS]: speechSynthesis not supported in this browser");
      if (onError) onError("Text-to-speech not supported");
      return;
    }

    try {
      // 1. Always cancel any ongoing speech
      window.speechSynthesis.cancel();

      // 2. Resume if browser paused it (known Chromium issue)
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      // 3. Create fresh utterance
      const utterance = new SpeechSynthesisUtterance(text);
      this.activeUtterance = utterance;
      // Also pin to window so Chromium garbage collector cannot kill it mid-speech
      (window as any).__active_sahay_tts__ = utterance;

      utterance.lang = bcp47Language;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // 4. Voice resolution
      const voices = window.speechSynthesis.getVoices() || [];
      if (voices.length > 0) {
        const langPrefix = bcp47Language.split("-")[0].toLowerCase();

        // Exact match (e.g. hi-IN, en-IN, ta-IN)
        const exact = voices.find((v) => v.lang.toLowerCase() === bcp47Language.toLowerCase());
        // Prefix match (e.g. hi, ta, mr)
        const prefix = voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));
        // Indian English
        const enIn = voices.find((v) => v.lang.toLowerCase().includes("en-in") || v.lang.toLowerCase().includes("en_in"));
        // Default or first voice
        const fallback = voices.find((v) => v.default) || voices[0];

        const selectedVoice = exact || prefix || enIn || fallback;
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      // 5. Wire lifecycle events
      utterance.onstart = () => {
        if (onStart) onStart();
      };

      utterance.onend = () => {
        this.activeUtterance = null;
        (window as any).__active_sahay_tts__ = null;
        if (onEnd) onEnd();
      };

      utterance.onerror = (e: any) => {
        // 'canceled' or 'interrupted' is normal when user clicks stop
        if (e.error === "canceled" || e.error === "interrupted") {
          this.activeUtterance = null;
          (window as any).__active_sahay_tts__ = null;
          if (onEnd) onEnd();
          return;
        }

        console.warn("[SAHAY TTS Error Event]:", e);
        this.activeUtterance = null;
        (window as any).__active_sahay_tts__ = null;
        if (onError) onError(e);
      };

      // 6. Speak!
      window.speechSynthesis.speak(utterance);

      // Chrome long-text workaround: chrome stops speaking after ~15s unless paused/resumed periodically
      const resumeInterval = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          clearInterval(resumeInterval);
        } else {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 10000);

    } catch (err) {
      console.error("[SAHAY TTS Exception]:", err);
      if (onError) onError(err);
    }
  }

  stop(): void {
    if (this.isSupported()) {
      try {
        window.speechSynthesis.cancel();
        this.activeUtterance = null;
        (window as any).__active_sahay_tts__ = null;
      } catch {}
    }
  }
}

export const textToSpeechAdapter = new WebSpeechSynthesisAdapter();
