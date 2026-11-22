"use client";

import React, { useState, useRef, useEffect } from "react";
import { useApp } from "@/core/context/AppContext";
import { speechToTextAdapter } from "@/core/speech/web-speech";
import { SpeechRecognitionState } from "@/core/speech/types";
import { Mic, MicOff, AlertCircle, Loader2 } from "lucide-react";

interface VoiceInputButtonProps {
  onTranscript: (transcript: string, isFinal: boolean) => void;
  className?: string;
}

export function VoiceInputButton({
  onTranscript,
  className = "",
}: VoiceInputButtonProps) {
  const { languageDescriptor, t } = useApp();
  const [state, setState] = useState<SpeechRecognitionState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [interimText, setInterimText] = useState("");
  const [isMediaRecording, setIsMediaRecording] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const isListening = state === "listening" || isMediaRecording;

  useEffect(() => {
    return () => {
      speechToTextAdapter.stop();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // Mode 1: Try Native WebSpeech first
  const startWebSpeech = () => {
    setErrorMessage(null);
    setInterimText("");

    speechToTextAdapter.start(
      languageDescriptor.bcp47,
      (res) => {
        setInterimText(res.transcript);
        onTranscript(res.transcript, res.isFinal);
      },
      (err) => {
        // If Google Cloud server is unreachable on localhost/VPN, automatically switch to Direct Microphone Recording
        if (err.includes("unreachable") || err.includes("network")) {
          console.log("[SAHAY Voice]: Switching to direct MediaRecorder fallback...");
          startDirectMediaRecorder();
        } else {
          setErrorMessage(err);
        }
      },
      (newState) => {
        setState(newState);
      }
    );
  };

  // Mode 2: Direct MediaRecorder (records actual audio chunks, zero Google Speech Cloud dependency)
  const startDirectMediaRecorder = async () => {
    try {
      setErrorMessage(null);
      setState("idle");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        setIsMediaRecording(false);
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        if (audioBlob.size > 0) {
          setIsProcessingAudio(true);
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
              setInterimText(data.transcript);
              onTranscript(data.transcript, true);
            } else if (data.error === "NO_GEMINI_KEY") {
              setErrorMessage("Google Speech Cloud is blocked on your network. You can type below or add GEMINI_API_KEY in .env.local for server-side audio transcription.");
            } else {
              setErrorMessage("Could not transcribe audio. Please type below.");
            }
          } catch {
            setErrorMessage("Audio transcription request failed. Please type your message.");
          } finally {
            setIsProcessingAudio(false);
          }
        }
      };

      recorder.start();
      setIsMediaRecording(true);
    } catch (err: any) {
      console.warn("[MediaRecorder Access Error]:", err);
      setErrorMessage("Microphone access was denied or unavailable. Please type your details below.");
    }
  };

  const toggleListening = () => {
    if (isListening) {
      if (isMediaRecording && mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      } else {
        speechToTextAdapter.stop();
        setState("idle");
      }
    } else {
      startWebSpeech();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <button
        type="button"
        onClick={toggleListening}
        disabled={isProcessingAudio}
        className={`w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all min-h-[64px] select-none cursor-pointer ${
          isListening
            ? "bg-red-600 hover:bg-red-700 text-white shadow-xl ring-4 ring-red-300 animate-pulse"
            : "bg-sahay-green-700 hover:bg-sahay-green-800 active:bg-sahay-green-900 text-white shadow-lg active:scale-[0.99]"
        } ${className}`}
        aria-pressed={isListening}
        aria-label={isListening ? t.common.stopListening : t.common.speakNow}
      >
        {isProcessingAudio ? (
          <>
            <Loader2 className="w-7 h-7 animate-spin" />
            <span className="text-xl font-bold">आवाज़ पहचानी जा रही है (Processing Audio)...</span>
          </>
        ) : isListening ? (
          <>
            <MicOff className="w-7 h-7 animate-bounce" />
            <span className="text-xl font-bold">{t.common.stopListening} (बोलना पूरा करें)</span>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-sahay-green-800 flex items-center justify-center text-white">
              <Mic className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold">{t.common.speakNow} (बोलकर बताएं)</span>
          </>
        )}
      </button>

      {/* Recording State Card */}
      {isListening && (
        <div className="w-full p-4 rounded-xl bg-red-50 border border-red-200 text-center space-y-1">
          <div className="flex items-center justify-center gap-2 text-red-800 font-bold text-sm">
            <span className="w-3 h-3 rounded-full bg-red-600 animate-ping"></span>
            <span>माइक्रोफ़ोन चालू है • Microphone is Recording...</span>
          </div>
          {interimText ? (
            <p className="text-base text-sahay-navy-950 font-semibold italic bg-white p-2 rounded-lg border border-red-100">
              "{interimText}"
            </p>
          ) : (
            <p className="text-xs text-red-600">
              बोलिए, फिर समाप्त करने के लिए ऊपर लाल बटन पर क्लिक करें।
            </p>
          )}
        </div>
      )}

      {/* Error & Diagnostic Feedback */}
      {errorMessage && (
        <div className="w-full p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
