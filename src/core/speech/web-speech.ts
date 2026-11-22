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
  private retryWithEnglish: boolean = false;

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
      onError("Your browser does not support Web Speech Recognition. Please use Google Chrome or Edge.");
      return;
    }

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
      
      // Fallback: If regional lang code was rejected by Google server, try en-IN
      rec.lang = this.retryWithEnglish ? "en-IN" : (bcp47Language || "en-IN");
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
          onResult({
            transcript: currentWords,
            isFinal: !!finalStr && !interimStr,
            confidence: event.results[event.results.length - 1]?.[0]?.confidence,
          });
        }
      };

      rec.onerror = (event: any) => {
        console.warn("[SAHAY Speech Error Event]:", event.error);

        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          this.isListening = false;
          onStateChange("permission_denied");
          onError("Microphone permission denied. Click the lock (🔒) icon on the address bar to allow microphone.");
        } else if (event.error === "network") {
          // If Google speech server returned network error for regional lang, auto-fallback to en-IN once
          if (!this.retryWithEnglish) {
            console.warn("[SAHAY Speech]: Retrying with 'en-IN' voice server fallback...");
            this.retryWithEnglish = true;
            try {
              rec.stop();
              setTimeout(() => {
                if (this.isListening) {
                  this.start("en-IN", onResult, onError, onStateChange);
                }
              }, 300);
              return;
            } catch {}
          }
          this.isListening = false;
          onStateChange("error");
          onError("Google Speech Cloud is unreachable on this connection (common on VPNs/firewalls or localhost). Please use the quick example buttons or type your response directly.");
        } else if (event.error === "no-speech") {
          // Do not fail, keep listening
        } else {
          this.isListening = false;
          onStateChange("error");
          onError(`Voice recognition error (${event.error}). Please type below.`);
        }
      };

      rec.onend = () => {
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
      this.isListening = false;
      onStateChange("error");
      onError(err.message || "Failed to initialize microphone.");
    }
  }

  stop(): void {
    this.isListening = false;
    this.retryWithEnglish = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
      this.recognition = null;
    }
  }
}

export const speechToTextAdapter = new DirectSpeechRecognitionAdapter();
