import { SpeechToTextAdapter, SpeechRecognitionResult, SpeechRecognitionState } from "./types";

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export class DirectSpeechRecognitionAdapter implements SpeechToTextAdapter {
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
      onError("Your browser does not support voice recognition. Please use Google Chrome or Edge.");
      return;
    }

    try {
      const SpeechRecognitionConstructor =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      // Abort any previous running instance cleanly
      if (this.recognition) {
        try {
          this.recognition.abort();
        } catch {}
        this.recognition = null;
      }

      const rec = new SpeechRecognitionConstructor();
      
      // Setup language & properties
      rec.lang = bcp47Language || "hi-IN";
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        this.isListening = true;
        onStateChange("listening");
      };

      rec.onresult = (event: any) => {
        let finalStr = "";
        let interimStr = "";

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            finalStr += res[0].transcript + " ";
          } else {
            interimStr += res[0].transcript;
          }
        }

        const currentWords = (finalStr + interimStr).trim();
        if (currentWords) {
          // Immediately send text so user sees real-time typing in text box
          onResult({
            transcript: currentWords,
            isFinal: !!finalStr && !interimStr,
            confidence: event.results[event.results.length - 1]?.[0]?.confidence,
          });
        }
      };

      rec.onerror = (event: any) => {
        console.warn("[SAHAY Speech]: error event", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          this.isListening = false;
          onStateChange("permission_denied");
          onError("Microphone permission denied. Click the lock/settings icon in the address bar to allow microphone.");
        } else if (event.error === "network") {
          onError("Voice network error. Chrome speech server was unreachable. Please type or check internet.");
        }
      };

      rec.onend = () => {
        // If ended but user is still in listening mode, auto-restart to prevent unexpected stops
        if (this.isListening) {
          try {
            rec.start();
          } catch {
            this.isListening = false;
            onStateChange("idle");
          }
        } else {
          onStateChange("idle");
        }
      };

      this.recognition = rec;
      rec.start();
    } catch (err: any) {
      console.error("[Speech Start Error]:", err);
      this.isListening = false;
      onStateChange("error");
      onError(err.message || "Failed to start microphone.");
    }
  }

  stop(): void {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
      this.recognition = null;
    }
  }
}

export const speechToTextAdapter = new DirectSpeechRecognitionAdapter();
