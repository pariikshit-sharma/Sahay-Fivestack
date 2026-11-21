"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/core/context/AppContext";
import { textToSpeechAdapter } from "@/core/speech/tts";
import { Volume2, VolumeX } from "lucide-react";

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
      textToSpeechAdapter.speak(
        textToRead,
        languageDescriptor.bcp47,
        () => setIsPlaying(true),
        () => setIsPlaying(false),
        () => setIsPlaying(false)
      );
    }
  };

  return (
    <button
      type="button"
      onClick={togglePlayback}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all min-h-[40px] ${
        isPlaying
          ? "bg-red-50 text-red-700 border-red-200 animate-pulse"
          : "bg-sahay-warm-100 text-sahay-navy-900 hover:bg-sahay-warm-200 border-sahay-warm-300"
      } ${className}`}
      aria-label={isPlaying ? t.common.stopAudio : label || t.common.readAloud}
      title={isPlaying ? t.common.stopAudio : label || t.common.readAloud}
    >
      {isPlaying ? (
        <>
          <VolumeX className="w-4 h-4 text-red-600" />
          <span>{t.common.stopAudio}</span>
        </>
      ) : (
        <>
          <Volume2 className="w-4 h-4 text-sahay-navy-800" />
          <span>{label || t.common.readAloud}</span>
        </>
      )}
    </button>
  );
}
