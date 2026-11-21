"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/core/context/AppContext";
import { speechToTextAdapter } from "@/core/speech/web-speech";
import { SpeechRecognitionState } from "@/core/speech/types";
import { Mic, MicOff, AlertCircle, Loader2 } from "lucide-react";

interface VoiceInputButtonProps {
  onTranscript: (transcript: string, isFinal: boolean) => void;
  className?: string;
  size?: "md" | "lg" | "touch";
}

export function VoiceInputButton({
  onTranscript,
  className = "",
  size = "touch",
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
        className={`w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all min-h-[60px] select-none ${
          isListening
            ? "bg-red-600 text-white shadow-voice animate-pulse"
            : "bg-sahay-green-700 hover:bg-sahay-green-800 active:bg-sahay-green-900 text-white shadow-md active:scale-[0.99]"
        } ${className}`}
        aria-pressed={isListening}
        aria-label={isListening ? t.common.stopListening : t.common.speakNow}
      >
        {isListening ? (
          <>
            <MicOff className="w-7 h-7 animate-bounce" />
            <span className="text-xl font-bold">{t.common.stopListening}</span>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-sahay-green-800 flex items-center justify-center text-white">
              <Mic className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold">{t.common.speakNow}</span>
          </>
        )}
      </button>

      {/* Live Listening Banner with Words Preview */}
      {isListening && (
        <div className="w-full p-4 rounded-xl bg-sahay-green-50 border border-sahay-green-200 text-center space-y-1">
          <div className="flex items-center justify-center gap-2 text-sahay-green-900 font-bold text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
            <span>{t.common.listening} ({languageDescriptor.nameNative})</span>
          </div>
          {interimText && (
            <p className="text-base text-sahay-navy-950 font-medium italic">
              "{interimText}"
            </p>
          )}
        </div>
      )}

      {/* Permission / Unsupported Browser Diagnostic Message */}
      {state === "permission_denied" && (
        <div className="w-full p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-700 mt-0.5" />
          <div>
            <strong>माइक अनुमति आवश्यक है • Microphone Permission Needed:</strong>
            <p className="mt-1">
              कृपया ब्राउज़र के एड्रेस बार में लॉक (🔒) आइकन पर क्लिक करके माइक्रोफ़ोन की अनुमति दें। आप नीचे दिए गए विकल्पों को छूकर भी आगे बढ़ सकते हैं।
            </p>
          </div>
        </div>
      )}

      {state === "unsupported" && (
        <div className="w-full p-3 rounded-xl bg-sahay-warm-100 border border-sahay-warm-300 text-sahay-navy-900 text-xs text-center">
          इस ब्राउज़र में आवाज पहचान उपलब्ध नहीं है। कृपया गूगल क्रोम (Google Chrome) का उपयोग करें या नीचे लिखकर/चुनकर उत्तर दें।
        </div>
      )}
    </div>
  );
}
