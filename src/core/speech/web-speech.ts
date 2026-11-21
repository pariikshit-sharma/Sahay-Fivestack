import { SpeechToTextAdapter, SpeechRecognitionResult, SpeechRecognitionState } from "./types";

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export class WebSpeechAdapter implements SpeechToTextAdapter {
  private recognition: any = null;
  private isListening: boolean = false;

  isSupported(): boolean {
    if (typeof window === "undefined") return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  start(
    bcp47Language: string,
    onResult: (result: SpeechRecognitionResult) => void,
    onError: (error: string) => void,
    onStateChange: (state: SpeechRecognitionState) => void
  ): void {
    if (!this.isSupported()) {
      onStateChange("unsupported");
      onError("Speech recognition is not supported in this browser. Please use Google Chrome or type instead.");
      return;
    }

    try {
      const SpeechRecognitionConstructor =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (this.recognition) {
        try {
          this.recognition.abort();
        } catch {}
      }

      this.recognition = new SpeechRecognitionConstructor();
      this.recognition.lang = bcp47Language;
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.isListening = true;
        onStateChange("listening");
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        const transcript = (finalTranscript || interimTranscript).trim();
        if (transcript) {
          onResult({
            transcript,
            isFinal: !!finalTranscript,
            confidence: event.results[0]?.[0]?.confidence,
          });
        }
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          onStateChange("permission_denied");
          onError("Microphone permission was denied. Please allow microphone access in your browser settings.");
        } else if (event.error === "no-speech") {
          onStateChange("idle");
          // Non-critical, user just stayed quiet
        } else {
          onStateChange("error");
          onError(`Speech recognition error: ${event.error || "unknown"}`);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        onStateChange("idle");
      };

      this.recognition.start();
    } catch (err: any) {
      this.isListening = false;
      onStateChange("error");
      onError(err.message || "Failed to initialize microphone.");
    }
  }

  stop(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {}
      this.isListening = false;
    }
  }
}

export const speechToTextAdapter = new WebSpeechAdapter();
