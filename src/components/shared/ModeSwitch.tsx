"use client";

import React from "react";
import { useApp } from "@/core/context/AppContext";
import { Sparkles, SlidersHorizontal, Mic } from "lucide-react";

export function ModeSwitch() {
  const { mode, setMode, t } = useApp();

  return (
    <div
      className="inline-flex items-center p-1 rounded-2xl bg-sahay-warm-200 border border-sahay-warm-300"
      role="radiogroup"
      aria-label={t.common.switchMode}
    >
      <button
        type="button"
        role="radio"
        aria-checked={mode === "simple"}
        onClick={() => setMode("simple")}
        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all min-h-[40px] ${
          mode === "simple"
            ? "bg-white text-sahay-navy-950 shadow-sm border border-sahay-warm-300"
            : "text-sahay-navy-800 hover:text-sahay-navy-950"
        }`}
      >
        <Mic className={`w-4 h-4 ${mode === "simple" ? "text-sahay-green-700" : ""}`} />
        <span>{t.common.simpleMode}</span>
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={mode === "detailed"}
        onClick={() => setMode("detailed")}
        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all min-h-[40px] ${
          mode === "detailed"
            ? "bg-white text-sahay-navy-950 shadow-sm border border-sahay-warm-300"
            : "text-sahay-navy-800 hover:text-sahay-navy-950"
        }`}
      >
        <SlidersHorizontal className="w-4 h-4" />
        <span>{t.common.detailedMode}</span>
      </button>
    </div>
  );
}
