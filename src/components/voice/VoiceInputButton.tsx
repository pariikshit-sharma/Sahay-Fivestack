"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/core/context/AppContext";
import { speechToTextAdapter } from "@/core/speech/web-speech";
import { SpeechRecognitionState } from "@/core/speech/types";
import { Mic, MicOff, AlertCircle } from "lucide-react";

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

  const isListening = state === "listening";

  useEffect(() => {
    return () => {
      speechToTextAdapter.stop();
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      speechToTextAdapter.stop();
      setState("idle");
    } else {
      setErrorMessage(null);
      setInterimText("");

      speechToTextAdapter.start(
        languageDescriptor.bcp47,
        (res) => {
          setInterimText(res.transcript);
          // Directly pipe every recognized word into the text box
          onTranscript(res.transcript, res.isFinal);
        },
        (err) => {
          setErrorMessage(err);
        },
        (newState) => {
          setState(newState);
        }
      );
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <button
        type="button"
        onClick={toggleListening}
        className={`w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all min-h-[64px] select-none cursor-pointer ${
          isListening
            ? "bg-red-600 hover:bg-red-700 text-white shadow-xl ring-4 ring-red-300 animate-pulse"
            : "bg-sahay-green-700 hover:bg-sahay-green-800 active:bg-sahay-green-900 text-white shadow-lg active:scale-[0.99]"
        } ${className}`}
        aria-pressed={isListening}
        aria-label={isListening ? t.common.stopListening : t.common.speakNow}
      >
        {isListening ? (
          <>
            <MicOff className="w-7 h-7 animate-bounce" />
            <span className="text-xl font-bold">{t.common.stopListening} (बोलना बंद करें)</span>
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

      {/* Live Recording Feedback */}
      {isListening && (
        <div className="w-full p-4 rounded-xl bg-red-50 border border-red-200 text-center space-y-1">
          <div className="flex items-center justify-center gap-2 text-red-800 font-bold text-sm">
            <span className="w-3 h-3 rounded-full bg-red-600 animate-ping"></span>
            <span>माइक्रोफ़ोन सुन रहा है • Listening in {languageDescriptor.nameNative}...</span>
          </div>
          {interimText ? (
            <p className="text-base text-sahay-navy-950 font-semibold italic bg-white p-2 rounded-lg border border-red-100">
              "{interimText}"
            </p>
          ) : (
            <p className="text-xs text-red-600">
              बोलिए... आपकी आवाज़ नीचे टेक्स्ट बॉक्स में सीधे टाइप होगी
            </p>
          )}
        </div>
      )}

      {/* Error / Permission Diagnostic */}
      {errorMessage && (
        <div className="w-full p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
