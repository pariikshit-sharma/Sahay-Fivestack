"use client";

import React, { useState, useRef, useEffect } from "react";
import { useApp } from "@/core/context/AppContext";
import { speechToTextAdapter } from "@/core/speech/web-speech";
import { Mic, MicOff, AlertCircle, Loader2, Volume2 } from "lucide-react";

interface VoiceInputButtonProps {
  onTranscript: (transcript: string, isFinal: boolean) => void;
  className?: string;
}

export function VoiceInputButton({
  onTranscript,
  className = "",
}: VoiceInputButtonProps) {
  const { languageDescriptor, t, language } = useApp();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastTranscript, setLastTranscript] = useState<string>("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      stopAllRecording();
    };
  }, []);

  const stopAllRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
  };

  const startRecording = async () => {
    setErrorMessage(null);
    setLastTranscript("");
    setRecordingSeconds(0);

    // 1. Try Direct Microphone Capture (MediaRecorder) - 100% reliable across networks and firewalls
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("getUserMedia not supported in this browser");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];

      // Determine best supported MIME type
      let mimeType = "audio/webm";
      if (typeof MediaRecorder !== "undefined") {
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          mimeType = "audio/webm;codecs=opus";
        } else if (MediaRecorder.isTypeSupported("audio/webm")) {
          mimeType = "audio/webm";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
          mimeType = "audio/ogg";
        }
      }

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);

        // Turn off mic hardware track
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }

        const audioBlob = new Blob(audioChunksRef.current, {
          type: mimeType.split(";")[0] || "audio/webm",
        });

        if (audioBlob.size > 500) {
          await sendAudioForTranscription(audioBlob);
        } else {
          setErrorMessage(
            language === "hi"
              ? "आवाज़ बहुत छोटी थी। कृपया दोबारा बोलें।"
              : "Audio was too short. Please try speaking again."
          );
        }
      };

      recorder.start(250); // collect chunks every 250ms
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.warn("[MediaRecorder error, falling back to WebSpeech]:", err);

      // Fallback: WebSpeech
      if (speechToTextAdapter.isSupported()) {
        speechToTextAdapter.start(
          languageDescriptor.bcp47,
          (res) => {
            setLastTranscript(res.transcript);
            onTranscript(res.transcript, res.isFinal);
          },
          (webErr) => {
            setErrorMessage(webErr);
            setIsRecording(false);
          },
          (state) => {
            setIsRecording(state === "listening");
          }
        );
      } else {
        setErrorMessage(
          language === "hi"
            ? "माइक्रोफ़ोन की अनुमति नहीं मिल सकी। कृपया नीचे लिखकर बताएं।"
            : "Microphone permission was denied. Please type your details below."
        );
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    } else {
      speechToTextAdapter.stop();
      setIsRecording(false);
    }
  };

  const sendAudioForTranscription = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob);
      formData.append("language", languageDescriptor.code);

      const res = await fetch("/api/v1/speech/stt", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.transcript) {
        const text = data.transcript.trim();
        setLastTranscript(text);
        onTranscript(text, true);
      } else if (data.error === "NO_GEMINI_KEY") {
        setErrorMessage(
          language === "hi"
            ? "सर्वर ट्रांसक्रिप्शन के लिए GEMINI_API_KEY सेट करें या नीचे लिखें।"
            : "GEMINI_API_KEY required for server-side audio transcription."
        );
      } else {
        setErrorMessage(
          language === "hi"
            ? "आवाज़ स्पष्ट नहीं समझ आई। कृपया दोबारा बोलें या नीचे लिखें।"
            : "Could not transcribe audio clearly. Please try again or type below."
        );
      }
    } catch (err: any) {
      console.error("[Audio STT fetch error]:", err);
      setErrorMessage(
        language === "hi"
          ? "ऑडियो भेजने में त्रुटि हुई। कृपया नीचे लिखकर बताएं।"
          : "Audio upload failed. Please type your details below."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <button
        type="button"
        onClick={toggleRecording}
        disabled={isProcessing}
        className={`w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all min-h-[68px] select-none cursor-pointer shadow-md ${
          isRecording
            ? "bg-red-600 hover:bg-red-700 text-white ring-4 ring-red-300 animate-pulse shadow-xl"
            : "bg-sahay-green-700 hover:bg-sahay-green-800 active:bg-sahay-green-900 text-white active:scale-[0.99]"
        } ${className}`}
        aria-pressed={isRecording}
        aria-label={isRecording ? t.common.stopListening : t.common.speakNow}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-7 h-7 animate-spin" />
            <span className="text-xl font-bold">
              {language === "hi" ? "आवाज़ पहचानी जा रही है..." : "Transcribing your voice..."}
            </span>
          </>
        ) : isRecording ? (
          <>
            <MicOff className="w-7 h-7 animate-bounce" />
            <span className="text-xl font-bold">
              {language === "hi" ? "बोलना पूरा करें (Stop & Submit)" : "Stop Recording"}
              <span className="ml-2 text-sm font-mono bg-red-800/80 px-2.5 py-1 rounded-full">
                {String(Math.floor(recordingSeconds / 60)).padStart(2, "0")}:
                {String(recordingSeconds % 60).padStart(2, "0")}
              </span>
            </span>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-sahay-green-800 flex items-center justify-center text-white">
              <Mic className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold">
              {t.common.speakNow} ({language === "hi" ? "बोलकर बताएं" : "Tap to Speak"})
            </span>
          </>
        )}
      </button>

      {/* Recording in progress indicator */}
      {isRecording && (
        <div className="w-full p-4 rounded-xl bg-red-50 border border-red-200 text-center space-y-2 animate-fadeIn">
          <div className="flex items-center justify-center gap-2 text-red-800 font-bold text-sm">
            <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
            <span>
              {language === "hi"
                ? "🎙️ हम सुन रहे हैं... बोलिए (Recording in progress)"
                : "🎙️ Listening... Speak naturally"}
            </span>
          </div>

          <p className="text-xs text-red-700 font-medium">
            {language === "hi"
              ? "उदा: 'मैं हरियाणा का किसान हूँ, 2 एकड़ जमीन है और 80 हज़ार कमाता हूँ।' बोलकर ऊपर लाल बटन दबाएं।"
              : "Speak about your state, work, land or income, then tap the red button."}
          </p>
        </div>
      )}

      {/* Success transcript preview */}
      {lastTranscript && !isRecording && !isProcessing && (
        <div className="w-full p-3 rounded-xl bg-sahay-green-50 border border-sahay-green-300 text-xs text-sahay-navy-950 flex items-start gap-2">
          <Volume2 className="w-4 h-4 text-sahay-green-700 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold text-sahay-green-800">
              {language === "hi" ? "सुनी गई आवाज़:" : "Transcribed Speech:"}
            </span>{" "}
            <span>"{lastTranscript}"</span>
          </div>
        </div>
      )}

      {/* Error Feedback */}
      {errorMessage && (
        <div className="w-full p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
