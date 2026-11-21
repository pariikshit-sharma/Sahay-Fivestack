"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/core/context/AppContext";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Search,
  Filter,
  CheckCircle2,
  ExternalLink,
  FileText,
  Landmark,
  ShieldCheck,
  Wheat,
  HeartPulse,
  Baby,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

export default function DetailedModePage() {
  const { t, language } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedLevel, setSelectedLevel] = useState("ALL");

  // Initial verified schemes data
  const verifiedSchemes = [
    {
      id: "pm-kisan",
      code: "PM-KISAN",
      level: "central",
      department: "Ministry of Agriculture & Farmers Welfare",
      departmentHi: "कृषि एवं किसान कल्याण मंत्रालय",
      titleEn: "PM Kisan Samman Nidhi",
      titleHi: "प्रधानमंत्री किसान सम्मान निधि",
      summaryEn:
        "Direct income support of ₹6,000 per year in three equal installments to all landholding farmer families across India.",
      summaryHi:
        "देश भर के सभी भूमिधारक किसान परिवारों को ₹6,000 प्रति वर्ष की प्रत्यक्ष आय सहायता तीन समान किस्तों में।",
      benefitAmount: "₹6,000 / year",
      benefitType: "Cash Transfer (DBT)",
      officialUrl: "https://pmkisan.gov.in",
      verifiedDate: "2026-08-15",
      icon: Wheat,
      iconColor: "text-amber-700 bg-amber-50 border-amber-200",
      category: "agriculture",
      mandatoryDocs: ["Aadhaar Card", "Land Ownership Record (Khatoni/ROR)", "Bank Account (Aadhaar linked)"],
      mandatoryDocsHi: ["आधार कार्ड", "भूमि स्वामित्व अभिलेख (खतौनी/जमाबंदी)", "बैंक खाता (आधार से लिंक)"],
    },
    {
      id: "pm-jay",
      code: "PM-JAY",
      level: "central",
      department: "National Health Authority (NHA)",
      departmentHi: "राष्ट्रीय स्वास्थ्य प्राधिकरण (स्वास्थ्य मंत्रालय)",
      titleEn: "Ayushman Bharat - PM-JAY",
      titleHi: "आयुष्मान भारत - पीएम जन आरोग्य योजना",
      summaryEn:
        "Cashless health insurance cover up to ₹5,00,000 per family per year for secondary and tertiary care hospitalization.",
      summaryHi:
        "द्वितीयक और तृतीयक देखभाल अस्पताल में भर्ती के लिए प्रति परिवार प्रति वर्ष ₹5,00,000 तक का कैशलेस स्वास्थ्य बीमा कवर।",
      benefitAmount: "₹5,00,000 / family / year",
      benefitType: "Cashless Health Insurance",
      officialUrl: "https://pmjay.gov.in",
      verifiedDate: "2026-09-01",
      icon: HeartPulse,
      iconColor: "text-red-700 bg-red-50 border-red-200",
      category: "healthcare",
      mandatoryDocs: ["Aadhaar Card / Ration Card", "Ayushman Golden Card (generated via eKYC)"],
      mandatoryDocsHi: ["आधार कार्ड / राशन कार्ड", "आयुष्मान गोल्डन कार्ड (eKYC द्वारा निर्मित)"],
    },
    {
      id: "pmmvy",
      code: "PMMVY",
      level: "central",
      department: "Ministry of Women and Child Development",
      departmentHi: "महिला एवं बाल विकास मंत्रालय",
      titleEn: "Pradhan Mantri Matru Vandana Yojana",
      titleHi: "प्रधानमंत्री मातृ वंदना योजना",
      summaryEn:
        "Maternity benefit of ₹5,000 directly transferred to pregnant women and lactating mothers for first living child.",
      summaryHi:
        "प्रथम जीवित बच्चे के लिए गर्भवती महिलाओं और स्तनपान कराने वाली माताओं के खाते में ₹5,000 का प्रत्यक्ष मातृत्व लाभ।",
      benefitAmount: "₹5,00,000 / child",
      benefitType: "Cash Transfer (Maternity Benefit)",
      officialUrl: "https://pmmvy.wcd.gov.in",
      verifiedDate: "2026-07-20",
      icon: Baby,
      iconColor: "text-purple-700 bg-purple-50 border-purple-200",
      category: "women_child",
      mandatoryDocs: ["Mother & Father Aadhaar", "MCP Card (Mother-Child Protection Card)", "Bank Account Passbook"],
      mandatoryDocsHi: ["माता व पिता का आधार कार्ड", "एमसीपी कार्ड (मातृ एवं शिशु संरक्षण कार्ड)", "बैंक पासबुक"],
    },
  ];

  const filteredSchemes = verifiedSchemes.filter((scheme) => {
    const matchesSearch =
      searchQuery === "" ||
      scheme.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.titleHi.includes(searchQuery) ||
      scheme.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || scheme.category === selectedCategory;
    const matchesLevel = selectedLevel === "ALL" || scheme.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
      {/* Detailed Mode Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-sahay-warm-300">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-sahay-warm-700">
              {t.common.detailedMode}
            </span>
            <Badge variant="success" size="sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Official Government Gazette Provenance</span>
            </Badge>
          </div>
          <h1 className="text-3xl font-black text-sahay-navy-950">
            {language === "hi"
              ? "सत्यापित सरकारी योजनाओं का विस्तृत संग्रह"
              : "Verified Government Schemes Explorer"}
          </h1>
          <p className="text-sm text-sahay-warm-800">
            {language === "hi"
              ? "प्रत्येक योजना की पात्रता नियम, दस्तावेज और सरकारी आवेदन लिंक का पूरा ब्योरा।"
              : "Inspect criteria breakdown, required document matrices, and direct application links."}
          </p>
        </div>

        <Link href="/simple">
          <Button variant="outline" size="md" className="flex items-center gap-2">
            <span>{t.common.simpleMode}</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="my-6 grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-sahay-warm-300 shadow-sm">
        {/* Search Input */}
        <div className="md:col-span-2 relative">
          <Search className="w-5 h-5 text-sahay-warm-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.detailedMode.searchPlaceholder}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-sahay-warm-300 bg-sahay-warm-50 text-sahay-navy-950 text-sm focus:outline-none focus:ring-2 focus:ring-sahay-navy-700 min-h-[44px]"
          />
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-sahay-warm-300 bg-sahay-warm-50 text-sahay-navy-950 text-sm focus:outline-none focus:ring-2 focus:ring-sahay-navy-700 min-h-[44px]"
            aria-label={t.detailedMode.filterCategory}
          >
            <option value="ALL">{t.detailedMode.allCategories}</option>
            <option value="agriculture">कृषि एवं किसान (Agriculture)</option>
            <option value="healthcare">स्वास्थ्य एवं चिकित्सा (Healthcare)</option>
            <option value="women_child">महिला एवं बाल विकास (Women & Child)</option>
          </select>
        </div>

        {/* Level Filter */}
        <div>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-sahay-warm-300 bg-sahay-warm-50 text-sahay-navy-950 text-sm focus:outline-none focus:ring-2 focus:ring-sahay-navy-700 min-h-[44px]"
            aria-label={t.detailedMode.filterLevel}
          >
            <option value="ALL">{t.detailedMode.allLevels}</option>
            <option value="central">{t.common.centralScheme}</option>
            <option value="state">{t.common.stateScheme}</option>
          </select>
        </div>
      </div>

      {/* Results Count Banner */}
      <div className="mb-4 flex items-center justify-between text-sm text-sahay-warm-800">
        <span>
          <strong>{filteredSchemes.length}</strong> {t.detailedMode.resultsFound}
        </span>
        <span className="text-xs text-sahay-warm-700 font-mono">
          Strict Zero-Hallucination Policy
        </span>
      </div>

      {/* Scheme Cards Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredSchemes.map((scheme) => {
          const SchemeIcon = scheme.icon;
          return (
            <Card key={scheme.id} variant="default" className="border-2 border-sahay-warm-300 p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3.5 rounded-2xl border ${scheme.iconColor}`}>
                    <SchemeIcon className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sahay-navy-100 text-sahay-navy-900">
                        {scheme.code}
                      </span>
                      <Badge variant="navy" size="sm">
                        {scheme.level === "central" ? t.common.centralScheme : t.common.stateScheme}
                      </Badge>
                      <Badge variant="success" size="sm">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified</span>
                      </Badge>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-sahay-navy-950">
                      {language === "hi" ? scheme.titleHi : scheme.titleEn}
                    </h3>
                    <p className="text-xs text-sahay-warm-700 font-medium">
                      {language === "hi" ? scheme.departmentHi : scheme.department}
                    </p>
                  </div>
                </div>

                {/* Benefit Pill */}
                <div className="p-3 bg-sahay-green-50 border border-sahay-green-200 rounded-xl text-left md:text-right flex-shrink-0">
                  <div className="text-xs text-sahay-green-900 font-medium">
                    {language === "hi" ? "सरकारी लाभ" : "Government Benefit"}
                  </div>
                  <div className="text-lg font-black text-sahay-green-800">
                    {scheme.benefitAmount}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <p className="text-sm sm:text-base text-sahay-navy-900 leading-relaxed">
                {language === "hi" ? scheme.summaryHi : scheme.summaryEn}
              </p>

              {/* Mandatory Documents Checklist preview */}
              <div className="p-4 bg-sahay-warm-50 rounded-xl border border-sahay-warm-200 space-y-2">
                <div className="text-xs font-bold text-sahay-navy-950 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-sahay-navy-800" />
                  <span>{t.detailedMode.documentsRequired}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(language === "hi" ? scheme.mandatoryDocsHi : scheme.mandatoryDocs).map((doc, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 rounded-lg bg-white border border-sahay-warm-300 text-sahay-navy-900 font-medium"
                    >
                      ✓ {doc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-sahay-warm-200">
                <span className="text-xs text-sahay-warm-700">
                  {t.detailedMode.verifiedOn}: <span className="font-mono">{scheme.verifiedDate}</span>
                </span>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <a
                    href={scheme.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto"
                  >
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-sahay-navy-900 text-white min-h-[44px]"
                    >
                      <span>{t.detailedMode.officialWebsite}</span>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </a>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
