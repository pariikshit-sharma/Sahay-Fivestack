import { TextToSpeechAdapter } from "./types";

export class WebSpeechSynthesisAdapter implements TextToSpeechAdapter {
  isSupported(): boolean {
    if (typeof window === "undefined") return false;
    return !!window.speechSynthesis;
  }

  getVoices(): SpeechSynthesisVoice[] {
    if (!this.isSupported()) return [];
    return window.speechSynthesis.getVoices();
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
      window.speechSynthesis.cancel(); // Stop any pending speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = bcp47Language;
      utterance.rate = 0.95; // Slightly slower for clear Indian language delivery
      utterance.pitch = 1.0;

      const voices = this.getVoices();
      // Try finding exact language match
      const matchingVoice =
        voices.find((v) => v.lang.toLowerCase() === bcp47Language.toLowerCase()) ||
        voices.find((v) => v.lang.toLowerCase().startsWith(bcp47Language.split("-")[0].toLowerCase()));

      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      if (onStart) utterance.onstart = onStart;
      if (onEnd) utterance.onend = onEnd;
      if (onError) utterance.onerror = onError;

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      if (onError) onError(err);
    }
  }

  stop(): void {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
    }
  }
}

export const textToSpeechAdapter = new WebSpeechSynthesisAdapter();
