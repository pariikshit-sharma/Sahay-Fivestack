import { SpeechToTextAdapter, SpeechRecognitionResult, SpeechRecognitionState } from "./types";

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export class WebSpeechAdapter implements SpeechToTextAdapter {
  private recognition: any = null;
  private isExplicitlyStarted: boolean = false;
  private currentLanguage: string = "hi-IN";
  private restartTimeout: any = null;
  private accumulatedTranscript: string = "";

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
      onError("Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge, or type instead.");
      return;
    }

    this.currentLanguage = bcp47Language;
    this.isExplicitlyStarted = true;
    this.accumulatedTranscript = "";

    const initAndStart = () => {
      if (!this.isExplicitlyStarted) return;

      try {
        const SpeechRecognitionConstructor =
          window.SpeechRecognition || window.webkitSpeechRecognition;

        if (this.recognition) {
          try {
            this.recognition.abort();
          } catch {}
          this.recognition = null;
        }

        const rec = new SpeechRecognitionConstructor();
        rec.lang = this.currentLanguage;
        rec.continuous = true;
        rec.interimResults = true;
        rec.maxAlternatives = 1;

        rec.onstart = () => {
          onStateChange("listening");
        };

        rec.onresult = (event: any) => {
          let interim = "";
          let final = "";

          for (let i = 0; i < event.results.length; ++i) {
            const res = event.results[i];
            if (res.isFinal) {
              final += res[0].transcript + " ";
            } else {
              interim += res[0].transcript;
            }
          }

          const combined = (final + interim).trim();
          if (combined) {
            onResult({
              transcript: combined,
              isFinal: !!final,
              confidence: event.results[0]?.[0]?.confidence,
            });
          }
        };

        rec.onerror = (event: any) => {
          console.warn("[SAHAY Speech Recognition Error]:", event.error);

          if (event.error === "not-allowed" || event.error === "service-not-allowed") {
            this.isExplicitlyStarted = false;
            onStateChange("permission_denied");
            onError("Microphone permission was denied. Please allow microphone access in your browser settings (click lock icon in address bar).");
          } else if (event.error === "no-speech") {
            // Keep listening, do not abort
          } else if (event.error === "network") {
            // Chrome speech recognition uses Google servers; network glitch
            console.warn("[SAHAY Speech]: network glitch, attempting keep-alive restart...");
          }
        };

        rec.onend = () => {
          // If the user hasn't explicitly clicked Stop, automatically keep recognition alive!
          if (this.isExplicitlyStarted) {
            clearTimeout(this.restartTimeout);
            this.restartTimeout = setTimeout(() => {
              if (this.isExplicitlyStarted) {
                try {
                  rec.start();
                } catch {
                  initAndStart();
                }
              }
            }, 300);
          } else {
            onStateChange("idle");
          }
        };

        this.recognition = rec;
        rec.start();
      } catch (err: any) {
        console.error("[SAHAY Speech Init Failed]:", err);
        this.isExplicitlyStarted = false;
        onStateChange("error");
        onError(err.message || "Failed to initialize microphone.");
      }
    };

    initAndStart();
  }

  stop(): void {
    this.isExplicitlyStarted = false;
    clearTimeout(this.restartTimeout);
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
    }
  }
}

export const speechToTextAdapter = new WebSpeechAdapter();
