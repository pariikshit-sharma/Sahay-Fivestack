"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/core/context/AppContext";
import { LanguageSelector } from "./LanguageSelector";
import { ModeSwitch } from "./ModeSwitch";
import { ShieldCheck } from "lucide-react";

export function Navbar() {
  const { t } = useApp();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-sahay-warm-200">
      {/* Skip to Content for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-sahay-navy-900 focus:text-white focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Top Banner: Public Trust Assurance */}
      <div className="bg-sahay-navy-950 text-white text-xs py-1.5 px-4 text-center sm:text-left flex items-center justify-between border-b border-sahay-navy-900">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-sahay-green-400"></span>
            <span className="font-medium text-sahay-warm-200">
              भारत सरकार कल्याणकारी योजना खोज मंच • Indian Government Welfare Discovery
            </span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-sahay-warm-300">
            <ShieldCheck className="w-3.5 h-3.5 text-sahay-green-400" />
            <span>100% Free Public Benefit Initiative • Zero Private Intermediaries</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Identity */}
          <Link
            href="/"
            className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sahay-navy-700 rounded-xl p-1"
          >
            <img
              src="/sahay-logo.png"
              alt="Sahay Official Logo"
              className="h-14 sm:h-16 w-auto object-contain rounded-xl hover:scale-105 transition-transform"
            />
          </Link>

          {/* Controls: Mode Switch & Language Selector */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/coverage"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sahay-navy-800 hover:text-sahay-navy-950 rounded-lg hover:bg-sahay-warm-100"
            >
              <span>कवरेज • Coverage</span>
            </Link>
            <div className="hidden sm:block">
              <ModeSwitch />
            </div>
            <LanguageSelector />
          </div>
        </div>
      </div>
    </header>
  );
}
