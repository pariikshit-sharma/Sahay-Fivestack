"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/core/context/AppContext";
import { textToSpeechAdapter } from "@/core/speech/tts";
import { Volume2, VolumeX, AlertCircle } from "lucide-react";

interface ReadAloudButtonProps {
  textToRead: string;
  className?: string;
  label?: string;
}

export function ReadAloudButton({
  textToRead,
  className = "",
  label,
}: ReadAloudButtonProps) {
  const { languageDescriptor, t } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      textToSpeechAdapter.stop();
    };
  }, []);

  const togglePlayback = () => {
    if (isPlaying) {
      textToSpeechAdapter.stop();
      setIsPlaying(false);
    } else {
      setErrorNotice(null);

      // In case voices are not yet loaded, pre-load
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.getVoices();
      }

      textToSpeechAdapter.speak(
        textToRead,
        languageDescriptor.bcp47,
        () => setIsPlaying(true),
        () => setIsPlaying(false),
        (err) => {
          console.warn("[TTS Button Callback Error]:", err);
          setIsPlaying(false);
          // If browser speech voice failed, notify gracefully
          setErrorNotice("Audio playback not supported on this device/voice");
          setTimeout(() => setErrorNotice(null), 4000);
        }
      );
    }
  };

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={togglePlayback}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all min-h-[40px] cursor-pointer ${
          isPlaying
            ? "bg-red-50 text-red-700 border-red-300 ring-2 ring-red-400"
            : "bg-sahay-warm-100 text-sahay-navy-900 hover:bg-sahay-warm-200 border-sahay-warm-300"
        } ${className}`}
        aria-label={isPlaying ? t.common.stopAudio : label || t.common.readAloud}
        title={isPlaying ? t.common.stopAudio : label || t.common.readAloud}
      >
        {isPlaying ? (
          <>
            <VolumeX className="w-4 h-4 text-red-600 animate-pulse" />
            <span>{t.common.stopAudio}</span>
          </>
        ) : (
          <>
            <Volume2 className="w-4 h-4 text-sahay-navy-800" />
            <span>{label || t.common.readAloud}</span>
          </>
        )}
      </button>

      {errorNotice && (
        <span className="text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {errorNotice}
        </span>
      )}
    </div>
  );
}
