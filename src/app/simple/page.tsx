"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/core/context/AppContext";
import { CitizenProfile, DefaultCitizenProfile } from "@/types/citizen";
import { extractCitizenProfile, ExtractionResult } from "@/core/profile/extractor";
import { evaluateScheme } from "@/core/eligibility/evaluator";
import { VERIFIED_NATIONAL_SCHEMES } from "@/core/schemes/verified-seeds";
import { SchemeEvaluationResult } from "@/types/scheme";
import { VoiceInputButton } from "@/components/voice/VoiceInputButton";
import { ReadAloudButton } from "@/components/voice/ReadAloudButton";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatINR } from "@/lib/utils";
import {
  Mic,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  RotateCcw,
  ExternalLink,
  FileCheck,
  Wheat,
  HeartPulse,
  Baby,
  ShieldCheck,
} from "lucide-react";

export default function SimpleModePage() {
  const { t, language } = useApp();

  // Wizard state: 'speak' | 'review' | 'results'
  const [phase, setPhase] = useState<"speak" | "review" | "results">("speak");
  const [transcript, setTranscript] = useState("");
  const [profile, setProfile] = useState<CitizenProfile>(DefaultCitizenProfile);
  const [extractedFields, setExtractedFields] = useState<string[]>([]);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [followUp, setFollowUp] = useState<ExtractionResult["suggestedFollowUp"]>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  const [matches, setMatches] = useState<SchemeEvaluationResult[]>([]);

  // Quick preset voice phrases for easy testing / quick tapping
  const quickPresets = [
    {
      labelHi: "मैं हरियाणा का किसान हूँ, 2 एकड़ जमीन है और 80 हज़ार कमाता हूँ।",
      labelEn: "I am a farmer from Haryana with 2 acres of land earning ₹80,000.",
      transcript: "मैं हरियाणा से हूँ, खेती करता हूँ, 2 एकड़ जमीन है और सालाना 80 हज़ार कमाता हूँ।",
    },
    {
      labelHi: "गर्भवती महिला, उम्र 24 वर्ष, उत्तर प्रदेश से।",
      labelEn: "Pregnant woman, age 24, from Uttar Pradesh.",
      transcript: "मैं उत्तर प्रदेश से महिला हूँ, मेरी उम्र 24 साल है और मैं गर्भवती हूँ।",
    },
    {
      labelHi: "दैनिक मजदूर, दिल्ली में रहता हूँ, आय 1.2 लाख।",
      labelEn: "Daily wage worker living in Delhi, annual income ₹1.2 Lakh.",
      transcript: "मैं दिल्ली में रहता हूँ, दिहाड़ी मजदूरी करता हूँ और पूरे साल में 1 लाख 20 हज़ार कमाता हूँ।",
    },
  ];

  // Process transcript into structured profile
  const handleTranscriptReceived = async (text: string) => {
    setTranscript(text);
    setIsProcessing(true);

    try {
      const result = await extractCitizenProfile(text, profile);
      setProfile(result.profile);
      setExtractedFields(result.extractedFields);
      setMissingFields(result.missingCriticalFields);
      setFollowUp(result.suggestedFollowUp);
      setPhase("review");
    } finally {
      setIsProcessing(false);
    }
  };

  // Run deterministic matching
  const handleConfirmAndMatch = () => {
    const results = VERIFIED_NATIONAL_SCHEMES.map((scheme) =>
      evaluateScheme(profile, scheme)
    );

    // Sort: likely_eligible first, then needs_information, then not_eligible
    const rank = {
      likely_eligible: 1,
      needs_information: 2,
      manual_verification: 3,
      not_eligible: 4,
    };
    results.sort((a, b) => rank[a.status] - rank[b.status]);

    setMatches(results);
    setPhase("results");
  };

  const handleReset = () => {
    setProfile(DefaultCitizenProfile);
    setTranscript("");
    setExtractedFields([]);
    setMissingFields([]);
    setFollowUp(undefined);
    setMatches([]);
    setPhase("speak");
  };

  return (
    <div className="flex-1 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
      {/* Top Navigation Bar */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-sahay-navy-800 hover:text-sahay-navy-950 p-2 -ml-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.common.back}</span>
        </Link>

        <div className="flex items-center gap-3">
          <Badge variant="navy" size="sm">
            {t.common.simpleMode}
          </Badge>
          <Link
            href="/detailed"
            className="text-xs text-sahay-warm-800 hover:text-sahay-navy-950 font-medium underline underline-offset-4"
          >
            {t.common.detailedMode}
          </Link>
        </div>
      </div>

      {/* PHASE 1: SPEAK OR TAP YOUR SITUATION */}
      {phase === "speak" && (
        <Card variant="default" className="shadow-lg border-2 border-sahay-warm-300 p-6 sm:p-8 space-y-6">
          <CardHeader className="p-0 space-y-3 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="p-3 rounded-2xl bg-sahay-green-100 text-sahay-green-800">
                <Mic className="w-8 h-8" />
              </span>
              <ReadAloudButton
                textToRead={
                  language === "hi"
                    ? "नमस्ते! आप अपने बारे में बोलकर बताएं। जैसे आप कहां रहते हैं, क्या काम करते हैं और कितनी कमाई है।"
                    : "Namaste! Speak naturally about where you live, what work you do, and your income."
                }
              />
            </div>

            <CardTitle className="text-2xl sm:text-3xl font-extrabold text-sahay-navy-950">
              {t.simpleMode.welcomeTitle}
            </CardTitle>
            <CardDescription className="text-base text-sahay-warm-900">
              {language === "hi"
                ? "माइक बटन दबाएं और अपनी स्थिति बोलकर बताएं — जैसे आपका राज्य, आपका काम, जमीन या पारिवारिक आय।"
                : "Tap the microphone and speak your situation — like your state, work, land, or family income."}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 space-y-6">
            {/* Primary Voice Action Button */}
            <VoiceInputButton
              onTranscript={(text, isFinal) => {
                setTranscript(text);
                if (isFinal && text.trim().length > 3) {
                  handleTranscriptReceived(text);
                }
              }}
            />

            {/* Manual text alternative */}
            <div className="space-y-2">
              <label
                htmlFor="manual-transcript"
                className="block text-xs font-bold text-sahay-warm-700 uppercase tracking-wider"
              >
                {t.common.typeInstead} (Or type below):
              </label>
              <div className="flex gap-2">
                <input
                  id="manual-transcript"
                  type="text"
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder={
                    language === "hi"
                      ? "उदा: मैं हरियाणा का किसान हूँ, 2 एकड़ जमीन है..."
                      : "e.g., I am a farmer from Haryana with 2 acres of land..."
                  }
                  className="flex-1 px-4 py-3 rounded-xl border border-sahay-warm-300 bg-white text-sahay-navy-950 text-base focus:outline-none focus:ring-2 focus:ring-sahay-navy-700"
                />
                <Button
                  variant="primary"
                  size="md"
                  disabled={!transcript.trim() || isProcessing}
                  onClick={() => handleTranscriptReceived(transcript)}
                >
                  <span>{t.common.next}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>

            {/* Example Presets for 1-Tap Convenience */}
            <div className="space-y-3 pt-2 border-t border-sahay-warm-200">
              <span className="text-xs font-bold text-sahay-warm-700 uppercase tracking-wider">
                {language === "hi" ? "त्वरित उदाहरण (छूकर चुनें):" : "Quick Examples (Tap to test):"}
              </span>
              <div className="space-y-2">
                {quickPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleTranscriptReceived(preset.transcript)}
                    className="w-full text-left p-3.5 rounded-xl border border-sahay-warm-300 bg-sahay-warm-50 hover:bg-sahay-warm-100 hover:border-sahay-navy-600 transition-all text-sm font-medium text-sahay-navy-900 flex items-center justify-between"
                  >
                    <span>{language === "hi" ? preset.labelHi : preset.labelEn}</span>
                    <Sparkles className="w-4 h-4 text-sahay-saffron-600 flex-shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PHASE 2: REVIEW EXTRACTED INFORMATION & ANSWER FOLLOW-UPS */}
      {phase === "review" && (
        <Card variant="default" className="shadow-lg border-2 border-sahay-warm-300 p-6 sm:p-8 space-y-6">
          <CardHeader className="p-0 space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="success" size="sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>{language === "hi" ? "जानकारी पहचानी गई" : "Information Extracted"}</span>
              </Badge>
              <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs">
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                <span>{language === "hi" ? "दोबारा बोलें" : "Start Over"}</span>
              </Button>
            </div>

            <CardTitle className="text-2xl font-black text-sahay-navy-950">
              {t.simpleMode.reviewTitle}
            </CardTitle>
            <CardDescription className="text-sm text-sahay-warm-800">
              {t.simpleMode.reviewSubtitle}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 space-y-5">
            {/* Citizen's Original Words */}
            <div className="p-3.5 rounded-xl bg-sahay-warm-100 border border-sahay-warm-200 text-xs sm:text-sm text-sahay-navy-950 italic">
              "{transcript}"
            </div>

            {/* Extracted Profile Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-xl border border-sahay-warm-300">
                <div className="text-xs text-sahay-warm-700 font-medium">
                  {language === "hi" ? "राज्य (State)" : "State"}
                </div>
                <div className="text-base font-bold text-sahay-navy-950">
                  {profile.state || (
                    <span className="text-xs text-amber-700 font-normal">
                      {language === "hi" ? "पूछना बाकी" : "Missing"}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-sahay-warm-300">
                <div className="text-xs text-sahay-warm-700 font-medium">
                  {language === "hi" ? "व्यवसाय (Occupation)" : "Occupation"}
                </div>
                <div className="text-base font-bold text-sahay-navy-950 capitalize">
                  {profile.occupation || (
                    <span className="text-xs text-amber-700 font-normal">
                      {language === "hi" ? "पूछना बाकी" : "Missing"}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-sahay-warm-300">
                <div className="text-xs text-sahay-warm-700 font-medium">
                  {language === "hi" ? "सालाना कमाई (Income)" : "Annual Income"}
                </div>
                <div className="text-base font-bold text-sahay-navy-950">
                  {profile.annualHouseholdIncome !== null ? (
                    formatINR(profile.annualHouseholdIncome)
                  ) : (
                    <span className="text-xs text-amber-700 font-normal">
                      {language === "hi" ? "पूछना बाकी" : "Missing"}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-sahay-warm-300">
                <div className="text-xs text-sahay-warm-700 font-medium">
                  {language === "hi" ? "जमीन (Landholding)" : "Landholding"}
                </div>
                <div className="text-base font-bold text-sahay-navy-950">
                  {profile.landholdingAcres !== null ? (
                    `${profile.landholdingAcres} Acres`
                  ) : (
                    <span className="text-xs text-amber-700 font-normal">
                      {language === "hi" ? "लागू नहीं" : "Not specified"}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-sahay-warm-300">
                <div className="text-xs text-sahay-warm-700 font-medium">
                  {language === "hi" ? "लिंग (Gender)" : "Gender"}
                </div>
                <div className="text-base font-bold text-sahay-navy-950 capitalize">
                  {profile.gender || (
                    <span className="text-xs text-amber-700 font-normal">
                      {language === "hi" ? "लागू नहीं" : "Not specified"}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-sahay-warm-300">
                <div className="text-xs text-sahay-warm-700 font-medium">
                  {language === "hi" ? "उम्र (Age)" : "Age"}
                </div>
                <div className="text-base font-bold text-sahay-navy-950">
                  {profile.age ? (
                    `${profile.age} Years`
                  ) : (
                    <span className="text-xs text-amber-700 font-normal">
                      {language === "hi" ? "लागू नहीं" : "Not specified"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Follow-up question if info is missing */}
            {followUp && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <HelpCircle className="w-5 h-5 text-amber-700" />
                  <span>{language === "hi" ? "पक्की पुष्टि के लिए जरूरी सवाल:" : "Help us confirm your eligibility:"}</span>
                </div>
                <p className="text-base font-semibold text-sahay-navy-950">
                  {language === "hi" ? followUp.questionHi : followUp.questionEn}
                </p>
                <div className="flex items-center gap-2">
                  <ReadAloudButton
                    textToRead={language === "hi" ? followUp.questionHi : followUp.questionEn}
                  />
                  <span className="text-xs text-amber-800">
                    {language === "hi" ? "आप इस सवाल का जवाब भी बोल सकते हैं" : "You can speak this answer too"}
                  </span>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="p-0 pt-4 flex items-center justify-between">
            <Button variant="ghost" size="md" onClick={() => setPhase("speak")}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>{t.common.back}</span>
            </Button>

            <Button
              variant="success"
              size="touch"
              onClick={handleConfirmAndMatch}
              className="flex items-center gap-2"
            >
              <span>{t.common.confirm}</span>
              <CheckCircle2 className="w-5 h-5" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* PHASE 3: RESULTS & ELIGIBILITY BREAKDOWN */}
      {phase === "results" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-sahay-warm-300">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="success" size="sm">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Deterministic Matching</span>
                </Badge>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-sahay-navy-950">
                {t.simpleMode.resultsTitle}
              </h2>
              <p className="text-sm text-sahay-warm-800">
                {t.simpleMode.resultsSubtitle}
              </p>
            </div>

            <Button variant="outline" size="sm" onClick={handleReset} className="flex-shrink-0">
              <RotateCcw className="w-4 h-4 mr-1" />
              <span>{language === "hi" ? "नई खोज करें" : "Check Again"}</span>
            </Button>
          </div>

          {/* Results List */}
          <div className="space-y-6">
            {matches.map((res) => {
              const isEligible = res.status === "likely_eligible";
              const needsInfo = res.status === "needs_information";

              return (
                <Card
                  key={res.scheme.id}
                  variant="default"
                  className={`border-2 p-6 space-y-4 ${
                    isEligible
                      ? "border-sahay-green-600 bg-white shadow-md"
                      : needsInfo
                      ? "border-amber-400 bg-amber-50/30"
                      : "border-sahay-warm-300 bg-sahay-warm-50 opacity-80"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sahay-navy-100 text-sahay-navy-900">
                          {res.scheme.officialCode}
                        </span>
                        {isEligible && (
                          <Badge variant="success" size="sm">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{t.status.likelyEligible}</span>
                          </Badge>
                        )}
                        {needsInfo && (
                          <Badge variant="warning" size="sm">
                            <HelpCircle className="w-4 h-4" />
                            <span>{t.status.needsInformation}</span>
                          </Badge>
                        )}
                        {!isEligible && !needsInfo && (
                          <Badge variant="subtle" size="sm">
                            <span>{t.status.notEligible}</span>
                          </Badge>
                        )}
                      </div>

                      <h3 className="text-xl sm:text-2xl font-black text-sahay-navy-950">
                        {language === "hi" ? res.scheme.titleHi : res.scheme.titleEn}
                      </h3>
                      <p className="text-xs text-sahay-warm-700 font-medium">
                        {res.scheme.department}
                      </p>
                    </div>

                    {/* Benefit amount */}
                    {res.scheme.benefitAmountMax && (
                      <div className="p-3 bg-sahay-green-100/70 border border-sahay-green-300 rounded-xl text-left sm:text-right flex-shrink-0">
                        <div className="text-xs text-sahay-green-950 font-semibold">
                          {language === "hi" ? "योजना का लाभ:" : "Benefit Amount:"}
                        </div>
                        <div className="text-xl font-black text-sahay-green-800">
                          {formatINR(res.scheme.benefitAmountMax)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Grounded Rationale Explanation (Why you qualify) */}
                  <div className="p-4 rounded-xl bg-sahay-warm-100 border border-sahay-warm-300 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sahay-navy-950 uppercase tracking-wider">
                        {t.simpleMode.whyEligible}:
                      </span>
                      <ReadAloudButton
                        textToRead={
                          language === "hi" ? res.rationaleSummaryHi : res.rationaleSummaryEn
                        }
                      />
                    </div>
                    <p className="text-sm sm:text-base font-semibold text-sahay-navy-900">
                      {language === "hi" ? res.rationaleSummaryHi : res.rationaleSummaryEn}
                    </p>

                    {/* List of passed criteria */}
                    {res.passedCriteria.length > 0 && (
                      <div className="pt-1 space-y-1">
                        {res.passedCriteria.map((c, i) => (
                          <div key={i} className="text-xs text-sahay-green-900 flex items-center gap-1.5 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-sahay-green-700 flex-shrink-0" />
                            <span>{language === "hi" ? c.explanationHi : c.explanationEn}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Missing criteria if any */}
                    {res.missingCriteria.length > 0 && (
                      <div className="pt-2 border-t border-sahay-warm-200 space-y-1">
                        <span className="text-xs font-bold text-amber-900">
                          {t.simpleMode.missingInfoTitle}:
                        </span>
                        {res.missingCriteria.map((m, i) => (
                          <div key={i} className="text-xs text-amber-800 flex items-center gap-1.5 font-medium">
                            <HelpCircle className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                            <span>{language === "hi" ? m.explanationHi : m.explanationEn}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Required Documents Matrix */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-sahay-navy-950 uppercase tracking-wider flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-sahay-navy-800" />
                      <span>{language === "hi" ? "जरूरी सरकारी दस्तावेज:" : "Required Official Documents:"}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {res.scheme.documents.map((doc) => (
                        <span
                          key={doc.id}
                          className="text-xs px-2.5 py-1 rounded-lg bg-white border border-sahay-warm-300 text-sahay-navy-900 font-medium"
                        >
                          ✓ {language === "hi" ? doc.nameHi : doc.nameEn}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Direct Official Link */}
                  <div className="pt-2 flex items-center justify-between border-t border-sahay-warm-200">
                    <span className="text-xs text-sahay-warm-700 font-mono">
                      Verified Gazette Provenance
                    </span>
                    <a
                      href={res.scheme.officialPortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="primary" size="sm" className="flex items-center gap-2 min-h-[44px]">
                        <span>{t.simpleMode.applyOfficial}</span>
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
