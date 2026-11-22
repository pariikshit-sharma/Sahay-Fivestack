import { TextToSpeechAdapter } from "./types";

export class UniversalAudioTTSAdapter implements TextToSpeechAdapter {
  private currentAudio: HTMLAudioElement | null = null;

  isSupported(): boolean {
    return true; // Supported in every modern browser via HTML5 Audio element
  }

  getVoices(): SpeechSynthesisVoice[] {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      return window.speechSynthesis.getVoices() || [];
    }
    return [];
  }

  speak(
    text: string,
    bcp47Language: string,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ): void {
    if (typeof window === "undefined") return;

    // 1. Stop any current playback
    this.stop();

    // 2. First attempt: Stream natural audio from SAHAY's backend audio streaming route
    try {
      const cleanText = text.replace(/[*_#]/g, "").slice(0, 200);
      const audioUrl = `/api/v1/speech/tts?text=${encodeURIComponent(cleanText)}&lang=${encodeURIComponent(bcp47Language)}`;

      const audio = new Audio(audioUrl);
      this.currentAudio = audio;

      audio.onplay = () => {
        if (onStart) onStart();
      };

      audio.onended = () => {
        this.currentAudio = null;
        if (onEnd) onEnd();
      };

      audio.onerror = (e) => {
        console.warn("[SAHAY Audio Fallback to Browser SpeechSynthesis]:", e);
        // Fallback to browser SpeechSynthesis if network audio stream fails
        this.speakBrowserFallback(text, bcp47Language, onStart, onEnd, onError);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("[SAHAY Audio Play Blocked/Failed, using fallback]:", err);
          this.speakBrowserFallback(text, bcp47Language, onStart, onEnd, onError);
        });
      }
    } catch (err) {
      this.speakBrowserFallback(text, bcp47Language, onStart, onEnd, onError);
    }
  }

  private speakBrowserFallback(
    text: string,
    bcp47Language: string,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      if (onError) onError("Audio not supported");
      return;
    }

    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = bcp47Language;
      utterance.rate = 1.0;

      const voices = window.speechSynthesis.getVoices() || [];
      const exact = voices.find((v) => v.lang.toLowerCase() === bcp47Language.toLowerCase());
      const fallback = voices.find((v) => v.lang.toLowerCase().startsWith("en")) || voices[0];
      if (exact || fallback) {
        utterance.voice = exact || fallback;
      }

      utterance.onstart = () => {
        if (onStart) onStart();
      };
      utterance.onend = () => {
        if (onEnd) onEnd();
      };
      utterance.onerror = (err) => {
        if (err.error !== "canceled" && onError) onError(err);
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      if (onError) onError(e);
    }
  }

  stop(): void {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {}
      this.currentAudio = null;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }
}

export const textToSpeechAdapter = new UniversalAudioTTSAdapter();
