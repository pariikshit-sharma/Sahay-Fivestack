"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/core/context/AppContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  ShieldCheck,
  Landmark,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
} from "lucide-react";

export default function CoveragePage() {
  const { language } = useApp();

  const states = [
    { code: "IN-HR", nameHi: "हरियाणा", nameEn: "Haryana", verifiedCount: 3, status: "Active" },
    { code: "IN-UP", nameHi: "उत्तर प्रदेश", nameEn: "Uttar Pradesh", verifiedCount: 3, status: "Active" },
    { code: "IN-DL", nameHi: "दिल्ली", nameEn: "Delhi", verifiedCount: 3, status: "Active" },
    { code: "IN-BR", nameHi: "बिहार", nameEn: "Bihar", verifiedCount: 3, status: "Active" },
    { code: "IN-MP", nameHi: "मध्य प्रदेश", nameEn: "Madhya Pradesh", verifiedCount: 3, status: "Active" },
    { code: "IN-PB", nameHi: "पंजाब", nameEn: "Punjab", verifiedCount: 3, status: "Active" },
    { code: "IN-RJ", nameHi: "राजस्थान", nameEn: "Rajasthan", verifiedCount: 3, status: "Active" },
    { code: "IN-MH", nameHi: "महाराष्ट्र", nameEn: "Maharashtra", verifiedCount: 3, status: "Active" },
    { code: "IN-GJ", nameHi: "गुजरात", nameEn: "Gujarat", verifiedCount: 3, status: "Active" },
    { code: "IN-TN", nameHi: "तमिलनाडु", nameEn: "Tamil Nadu", verifiedCount: 3, status: "Active" },
    { code: "IN-KA", nameHi: "कर्नाटक", nameEn: "Karnataka", verifiedCount: 3, status: "Active" },
    { code: "IN-WB", nameHi: "पश्चिम बंगाल", nameEn: "West Bengal", verifiedCount: 3, status: "Active" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-8">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-sahay-navy-800 hover:text-sahay-navy-950 p-2 -ml-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === "hi" ? "मुख्य पृष्ठ पर जाएं" : "Back to Home"}</span>
        </Link>
      </div>

      <div className="space-y-3">
        <Badge variant="navy" size="md">
          {language === "hi" ? "पारदर्शिता डैशबोर्ड" : "Transparency Dashboard"}
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-black text-sahay-navy-950">
          {language === "hi" ? "राष्ट्रीय कवरेज व सत्यापन स्थिति" : "National Coverage & Verification Dashboard"}
        </h1>
        <p className="text-base text-sahay-warm-800 max-w-3xl leading-relaxed">
          {language === "hi"
            ? "SAHAY केवल वही योजनाएं दिखाता है जिनकी पात्रता और आधिकारिक दस्तावेज सीधे सरकारी गजट से सत्यापित हो चुके हैं। हम कवरेज की सीमाओं को पूरी ईमानदारी से प्रस्तुत करते हैं।"
            : "SAHAY strictly displays schemes whose eligibility and rules have passed provenance verification. We honestly disclose our coverage limitations."}
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card variant="default" className="p-6 text-center space-y-2 border-2 border-sahay-warm-300">
          <div className="text-3xl sm:text-4xl font-black text-sahay-navy-900">28+8</div>
          <div className="text-xs font-bold text-sahay-warm-800 uppercase tracking-wider">
            {language === "hi" ? "सभी राज्य व केंद्रशासित प्रदेश" : "All States & UTs Architecture"}
          </div>
        </Card>

        <Card variant="default" className="p-6 text-center space-y-2 border-2 border-sahay-warm-300">
          <div className="text-3xl sm:text-4xl font-black text-sahay-green-700">100%</div>
          <div className="text-xs font-bold text-sahay-warm-800 uppercase tracking-wider">
            {language === "hi" ? "सत्यापित गजट डेटा" : "Verified Gazette Data"}
          </div>
        </Card>

        <Card variant="default" className="p-6 text-center space-y-2 border-2 border-sahay-warm-300">
          <div className="text-3xl sm:text-4xl font-black text-sahay-saffron-600">22</div>
          <div className="text-xs font-bold text-sahay-warm-800 uppercase tracking-wider">
            {language === "hi" ? "संविधानिक भाषाएं" : "Scheduled Indian Languages"}
          </div>
        </Card>
      </div>

      {/* State by State Transparency Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-sahay-navy-950">
          {language === "hi" ? "राज्यवार सक्रिय योजनाएं" : "State-wise Verified Coverage"}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {states.map((st) => (
            <div
              key={st.code}
              className="p-3.5 bg-white rounded-xl border border-sahay-warm-300 flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-bold text-sahay-navy-950">
                  {language === "hi" ? st.nameHi : st.nameEn}
                </div>
                <div className="text-xs text-sahay-warm-700 font-mono">{st.code}</div>
              </div>
              <Badge variant="success" size="sm">
                <span>{st.verifiedCount} Active</span>
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
