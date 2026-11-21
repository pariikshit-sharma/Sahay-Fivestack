export type SpeechRecognitionState =
  | "idle"
  | "listening"
  | "processing"
  | "unsupported"
  | "permission_denied"
  | "error";

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
  confidence?: number;
}

export interface SpeechToTextAdapter {
  isSupported(): boolean;
  start(
    bcp47Language: string,
    onResult: (result: SpeechRecognitionResult) => void,
    onError: (error: string) => void,
    onStateChange: (state: SpeechRecognitionState) => void
  ): void;
  stop(): void;
}

export interface TextToSpeechAdapter {
  isSupported(): boolean;
  speak(
    text: string,
    bcp47Language: string,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ): void;
  stop(): void;
  getVoices(): SpeechSynthesisVoice[];
}
