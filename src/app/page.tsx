"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/core/context/AppContext";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Mic,
  SlidersHorizontal,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Landmark,
  HeartPulse,
  Baby,
  Wheat,
  Languages,
  Check,
} from "lucide-react";

export default function HomePage() {
  const { t, language, mode, setMode } = useApp();

  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-sahay-warm-50 to-sahay-warm-100 py-12 md:py-20 border-b border-sahay-warm-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* National Initiative Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sahay-navy-100 border border-sahay-navy-200 text-sahay-navy-900 text-xs sm:text-sm font-semibold">
              <Landmark className="w-4 h-4 text-sahay-navy-800" />
              <span>राष्ट्रव्यापी जन कल्याण मंच • Verified Indian Welfare Discovery</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-sahay-navy-950 tracking-tight leading-tight">
              {t.landing.heroTitle}
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-sahay-warm-900 leading-relaxed font-normal">
              {t.landing.heroSubtitle}
            </p>

            {/* Dual-Mode Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/simple" className="w-full sm:w-auto" onClick={() => setMode("simple")}>
                <Button
                  size="touch"
                  variant="primary"
                  className="w-full sm:w-auto flex items-center justify-center gap-3 bg-sahay-navy-900 hover:bg-sahay-navy-800 text-white shadow-lg text-lg px-8 py-4"
                >
                  <div className="w-9 h-9 rounded-full bg-sahay-green-600 flex items-center justify-center text-white">
                    <Mic className="w-5 h-5 animate-pulse" />
                  </div>
                  <span className="font-bold">{t.landing.heroVoiceButton}</span>
                </Button>
              </Link>

              <Link href="/detailed" className="w-full sm:w-auto" onClick={() => setMode("detailed")}>
                <Button
                  size="touch"
                  variant="secondary"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 border-2 border-sahay-warm-300 text-sahay-navy-900 font-bold px-6 py-4"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                  <span>{t.landing.heroDetailedButton}</span>
                </Button>
              </Link>
            </div>

            {/* Trust Assurance */}
            <div className="pt-2 flex items-center justify-center gap-2 text-xs sm:text-sm text-sahay-warm-800 font-medium">
              <ShieldCheck className="w-4 h-4 text-sahay-green-700 flex-shrink-0" />
              <span>{t.landing.trustNote}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Core Schemes Spotlight */}
      <section className="py-12 md:py-16 bg-white border-b border-sahay-warm-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <Badge variant="navy" size="md">
              100% Verified Schemes
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-sahay-navy-950">
              {language === "hi"
                ? "सत्यापित राष्ट्रीय कल्याणकारी योजनाएं"
                : "Active Verified National Welfare Schemes"}
            </h2>
            <p className="text-sm sm:text-base text-sahay-warm-800">
              {language === "hi"
                ? "प्रत्येक योजना के नियम, पात्रता और दस्तावेज सीधे आधिकारिक गजट से सत्यापित किए गए हैं।"
                : "Every scheme's eligibility rules and required documents are strictly verified from official gazette circulars."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Scheme 1: PM-KISAN */}
            <Card variant="interactive" className="flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                    <Wheat className="w-6 h-6" />
                  </span>
                  <Badge variant="success" size="sm">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </Badge>
                </div>
                <CardTitle>
                  {language === "hi"
                    ? "प्रधानमंत्री किसान सम्मान निधि (PM-KISAN)"
                    : "PM Kisan Samman Nidhi (PM-KISAN)"}
                </CardTitle>
                <CardDescription>
                  {language === "hi"
                    ? "खेती योग्य भूमि के स्वामी किसान परिवारों को ₹6,000 प्रति वर्ष की वित्तीय सहायता सीधे बैंक खाते में।"
                    : "Direct income support of ₹6,000 per year in three installments for landholding farmer families."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-sahay-warm-50 rounded-xl text-xs space-y-1 border border-sahay-warm-200">
                  <div className="flex justify-between font-medium text-sahay-navy-900">
                    <span>{language === "hi" ? "वार्षिक लाभ:" : "Annual Benefit:"}</span>
                    <span className="font-bold text-sahay-green-700">₹6,000 / वर्ष</span>
                  </div>
                  <div className="flex justify-between text-sahay-warm-700">
                    <span>{language === "hi" ? "आधिकारिक पोर्टल:" : "Official Portal:"}</span>
                    <span className="font-mono text-sahay-navy-800">pmkisan.gov.in</span>
                  </div>
                </div>
                <Link href="/simple?scheme=pm-kisan" className="block w-full">
                  <Button variant="outline" size="sm" className="w-full justify-between">
                    <span>{language === "hi" ? "पात्रता जांचें" : "Check Eligibility"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Scheme 2: PM-JAY Ayushman Bharat */}
            <Card variant="interactive" className="flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2.5 rounded-xl bg-red-50 text-red-700 border border-red-200">
                    <HeartPulse className="w-6 h-6" />
                  </span>
                  <Badge variant="success" size="sm">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </Badge>
                </div>
                <CardTitle>
                  {language === "hi"
                    ? "आयुष्मान भारत - पीएम जन आरोग्य योजना (PM-JAY)"
                    : "Ayushman Bharat - PM-JAY"}
                </CardTitle>
                <CardDescription>
                  {language === "hi"
                    ? "गंभीर बीमारियों के मुफ्त इलाज हेतु प्रति परिवार ₹5 लाख तक का सालाना स्वास्थ्य बीमा कवर।"
                    : "Free hospital treatment and cashless health cover of up to ₹5 Lakh per eligible family per year."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-sahay-warm-50 rounded-xl text-xs space-y-1 border border-sahay-warm-200">
                  <div className="flex justify-between font-medium text-sahay-navy-900">
                    <span>{language === "hi" ? "स्वास्थ्य कवर:" : "Health Cover:"}</span>
                    <span className="font-bold text-sahay-green-700">₹5,00,000 / परिवार</span>
                  </div>
                  <div className="flex justify-between text-sahay-warm-700">
                    <span>{language === "hi" ? "आधिकारिक पोर्टल:" : "Official Portal:"}</span>
                    <span className="font-mono text-sahay-navy-800">pmjay.gov.in</span>
                  </div>
                </div>
                <Link href="/simple?scheme=pm-jay" className="block w-full">
                  <Button variant="outline" size="sm" className="w-full justify-between">
                    <span>{language === "hi" ? "पात्रता जांचें" : "Check Eligibility"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Scheme 3: PMMVY */}
            <Card variant="interactive" className="flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
                    <Baby className="w-6 h-6" />
                  </span>
                  <Badge variant="success" size="sm">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </Badge>
                </div>
                <CardTitle>
                  {language === "hi"
                    ? "प्रधानमंत्री मातृ वंदना योजना (PMMVY)"
                    : "Pradhan Mantri Matru Vandana Yojana (PMMVY)"}
                </CardTitle>
                <CardDescription>
                  {language === "hi"
                    ? "गर्भवती और स्तनपान कराने वाली माताओं के स्वास्थ्य व पोषण हेतु ₹5,000 की वित्तीय सहायता।"
                    : "Direct cash incentive of ₹5,000 to pregnant women and lactating mothers for health & nutrition."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-sahay-warm-50 rounded-xl text-xs space-y-1 border border-sahay-warm-200">
                  <div className="flex justify-between font-medium text-sahay-navy-900">
                    <span>{language === "hi" ? "मातृत्व सहायता:" : "Maternity Aid:"}</span>
                    <span className="font-bold text-sahay-green-700">₹5,000 सीधे खाते में</span>
                  </div>
                  <div className="flex justify-between text-sahay-warm-700">
                    <span>{language === "hi" ? "आधिकारिक पोर्टल:" : "Official Portal:"}</span>
                    <span className="font-mono text-sahay-navy-800">pmmvy.wcd.gov.in</span>
                  </div>
                </div>
                <Link href="/simple?scheme=pmmvy" className="block w-full">
                  <Button variant="outline" size="sm" className="w-full justify-between">
                    <span>{language === "hi" ? "पात्रता जांचें" : "Check Eligibility"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="py-12 md:py-16 bg-sahay-warm-50 border-b border-sahay-warm-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white border border-sahay-warm-300 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-sahay-navy-100 flex items-center justify-center text-sahay-navy-900">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-sahay-navy-950">
                {t.landing.feature1Title}
              </h3>
              <p className="text-sm text-sahay-warm-800 leading-relaxed">
                {t.landing.feature1Desc}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-sahay-warm-300 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-sahay-green-100 flex items-center justify-center text-sahay-green-800">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-sahay-navy-950">
                {t.landing.feature2Title}
              </h3>
              <p className="text-sm text-sahay-warm-800 leading-relaxed">
                {t.landing.feature2Desc}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-sahay-warm-300 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-sahay-saffron-100 flex items-center justify-center text-sahay-saffron-800">
                <Landmark className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-sahay-navy-950">
                {t.landing.feature3Title}
              </h3>
              <p className="text-sm text-sahay-warm-800 leading-relaxed">
                {t.landing.feature3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Coverage Transparency Statement */}
      <section className="py-12 bg-sahay-navy-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 max-w-xl text-center md:text-left">
              <h3 className="text-2xl font-bold text-white">
                {t.landing.coverageTitle}
              </h3>
              <p className="text-sm text-sahay-warm-300">
                {t.landing.coverageSubtitle}
              </p>
            </div>

            <div className="flex items-center gap-6 sm:gap-10">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-black text-sahay-saffron-400">28+8</div>
                <div className="text-xs text-sahay-warm-300 uppercase tracking-wider font-medium">
                  {language === "hi" ? "राज्य व केंद्रशासित" : "States & UTs"}
                </div>
              </div>

              <div className="w-px h-12 bg-sahay-navy-800"></div>

              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-black text-sahay-green-400">100%</div>
                <div className="text-xs text-sahay-warm-300 uppercase tracking-wider font-medium">
                  {language === "hi" ? "सत्यापित डेटा" : "Verified Provenance"}
                </div>
              </div>

              <div className="w-px h-12 bg-sahay-navy-800"></div>

              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-black text-white">22</div>
                <div className="text-xs text-sahay-warm-300 uppercase tracking-wider font-medium">
                  {language === "hi" ? "संविधानिक भाषाएं" : "Indian Languages"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
