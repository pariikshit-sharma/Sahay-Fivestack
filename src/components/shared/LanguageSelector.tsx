"use client";

import React, { useState, useRef, useEffect } from "react";
import { useApp } from "@/core/context/AppContext";
import { SUPPORTED_LANGUAGES } from "@/core/languages/registry";
import { Globe, Check, ChevronDown } from "lucide-react";

export function LanguageSelector() {
  const { language, setLanguage, t } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) ||
    SUPPORTED_LANGUAGES[0];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-base font-medium text-sahay-navy-950 bg-sahay-warm-100 hover:bg-sahay-warm-200 border border-sahay-warm-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sahay-navy-700 min-h-[44px]"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`${t.common.changeLanguage}: ${currentLang.nameNative}`}
      >
        <Globe className="w-5 h-5 text-sahay-navy-800" aria-hidden="true" />
        <span className="font-semibold text-sahay-navy-900">
          {currentLang.nameNative}
        </span>
        <span className="text-xs text-sahay-warm-700 hidden sm:inline">
          ({currentLang.nameEn})
        </span>
        <ChevronDown
          className={`w-4 h-4 text-sahay-warm-800 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-72 rounded-2xl shadow-xl bg-white border border-sahay-warm-300 ring-1 ring-black ring-opacity-5 z-50 overflow-hidden divide-y divide-sahay-warm-200"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="p-3 bg-sahay-warm-50 text-xs font-semibold text-sahay-warm-800 uppercase tracking-wider">
            {t.common.changeLanguage}
          </div>
          <div className="max-h-80 overflow-y-auto py-1">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors min-h-[48px] ${
                    isSelected
                      ? "bg-sahay-navy-50 text-sahay-navy-950 font-semibold"
                      : "text-sahay-navy-900 hover:bg-sahay-warm-100"
                  }`}
                  role="menuitem"
                >
                  <div className="flex flex-col">
                    <span className="text-base font-medium">
                      {lang.nameNative}
                    </span>
                    <span className="text-xs text-sahay-warm-700">
                      {lang.nameEn} • {lang.script}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {lang.supportTier === "fully_supported" ? (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-sahay-green-100 text-sahay-green-800 font-medium">
                        Tested
                      </span>
                    ) : lang.supportTier === "beta" ? (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">
                        Beta
                      </span>
                    ) : (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-sahay-warm-200 text-sahay-warm-800 font-medium">
                        Catalog
                      </span>
                    )}
                    {isSelected && (
                      <Check className="w-5 h-5 text-sahay-navy-900" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
