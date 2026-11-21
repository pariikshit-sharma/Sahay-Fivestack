"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/core/context/AppContext";
import { ShieldAlert, BookOpen, ExternalLink, Heart } from "lucide-react";

export function Footer() {
  const { t } = useApp();

  return (
    <footer className="bg-sahay-warm-100 border-t border-sahay-warm-300 pt-12 pb-16 text-sahay-navy-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-sahay-warm-300/80">
          {/* Column 1: Public Interest Mission */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-sahay-navy-950">
                SAHAY • सहाय
              </span>
            </div>
            <p className="text-sm text-sahay-warm-800 leading-relaxed">
              {t.common.tagline}
            </p>
            <p className="text-xs text-sahay-warm-700 leading-relaxed">
              Designed specifically for everyday Indian citizens, rural communities,
              elderly people, and first-time smartphone users to discover public welfare
              entitlements without middlemen or complex paperwork.
            </p>
          </div>

          {/* Column 2: Critical Public Safety Disclaimer */}
          <div className="space-y-3 bg-white p-5 rounded-2xl border border-sahay-warm-300">
            <div className="flex items-center gap-2 text-sahay-navy-950 font-bold text-sm">
              <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <span>महत्वपूर्ण सूचना • Important Citizen Notice</span>
            </div>
            <p className="text-xs text-sahay-warm-800 leading-relaxed">
              <strong>SAHAY कभी भी आपका आधार नंबर, बैंक खाता पासवर्ड या OTP नहीं मांगता।</strong>{" "}
              यह मंच केवल सरकारी योजनाओं की पात्रता जांचने और आधिकारिक आवेदन पोर्टल (.gov.in)
              तक मार्गदर्शन के लिए है। आवेदन केवल आधिकारिक सरकारी चैनलों पर ही करें।
            </p>
          </div>

          {/* Column 3: Standards & Provenance */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-sahay-navy-950 uppercase tracking-wider">
              पारदर्शिता व मानक • Transparency
            </h4>
            <ul className="space-y-2 text-sm text-sahay-warm-800">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sahay-green-600"></span>
                <span>सत्यापित सरकारी स्रोत (Official Gazette & .gov.in)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sahay-navy-600"></span>
                <span>Deterministic Logic (AI डिक्टेटेड निर्णय नहीं)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sahay-saffron-600"></span>
                <span>22 भारतीय भाषा सहयोग प्रणाली (8th Schedule)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sahay-navy-900"></span>
                <span>WCAG 2.1 AA Accessibility Compliant</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-sahay-warm-700 gap-4">
          <p>© 2026 SAHAY Project. Built for Indian Citizen Welfare.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-sahay-navy-900 font-medium">
              Made with <Heart className="w-3.5 h-3.5 text-red-600 fill-current" /> for Bharat
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
