"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/core/context/AppContext";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  HelpCircle,
  Sparkles,
  MapPin,
  Briefcase,
  IndianRupee,
  Layers,
} from "lucide-react";

export default function SimpleModePage() {
  const { t, language } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Example low-literacy friendly questions
  const steps = [
    {
      id: "state",
      titleHi: "आप किस राज्य या केंद्र शासित प्रदेश में रहते हैं?",
      titleEn: "Which state or union territory do you live in?",
      icon: MapPin,
      options: [
        { label: "हरियाणा (Haryana)", value: "IN-HR" },
        { label: "उत्तर प्रदेश (Uttar Pradesh)", value: "IN-UP" },
        { label: "दिल्ली (Delhi)", value: "IN-DL" },
        { label: "बिहार (Bihar)", value: "IN-BR" },
        { label: "मध्य प्रदेश (Madhya Pradesh)", value: "IN-MP" },
        { label: "अन्य राज्य (Other State)", value: "OTHER" },
      ],
    },
    {
      id: "occupation",
      titleHi: "आप आजीविका के लिए क्या काम करते हैं?",
      titleEn: "What do you do for work?",
      icon: Briefcase,
      options: [
        { label: "किसान (Farmer / Agriculture)", value: "farmer" },
        { label: "दैनिक मजदूर (Daily Wage Worker)", value: "daily_wage_worker" },
        { label: "छोटा दुकानदार / रेहड़ी (Street Vendor / Shopkeeper)", value: "street_vendor" },
        { label: "विद्यार्थी (Student)", value: "student" },
        { label: "गृहणी (Homemaker)", value: "homemaker" },
        { label: "अन्य काम (Other)", value: "other" },
      ],
    },
    {
      id: "income",
      titleHi: "आपके घर में सभी लोग मिलाकर लगभग कितना पैसा कमाते हैं?",
      titleEn: "Roughly how much does your entire household earn in a year?",
      icon: IndianRupee,
      options: [
        { label: "₹1 लाख से कम (Under ₹1 Lakh / yr)", value: "under_1l" },
        { label: "₹1 लाख से ₹2.5 लाख (₹1L - ₹2.5L / yr)", value: "1l_2.5l" },
        { label: "₹2.5 लाख से ₹5 लाख (₹2.5L - ₹5L / yr)", value: "2.5l_5l" },
        { label: "₹5 लाख से अधिक (Above ₹5 Lakh / yr)", value: "above_5l" },
      ],
    },
  ];

  const activeStep = steps[currentStep - 1] || steps[0];
  const StepIcon = activeStep.icon;

  const toggleVoiceRecording = () => {
    setIsRecording(!isRecording);
  };

  const toggleAudioPlayback = () => {
    setIsPlayingAudio(!isPlayingAudio);
  };

  return (
    <div className="flex-1 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto w-full">
      {/* Simple Mode Header & Step Indicator */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-sahay-navy-800 hover:text-sahay-navy-950 p-2 -ml-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.common.back}</span>
        </Link>

        <div className="flex items-center gap-2">
          <Badge variant="navy" size="sm">
            {t.simpleMode.onboardingStep} {currentStep} / {steps.length}
          </Badge>
          <Link
            href="/detailed"
            className="text-xs text-sahay-warm-800 hover:text-sahay-navy-950 font-medium underline underline-offset-4"
          >
            {t.common.detailedMode}
          </Link>
        </div>
      </div>

      {/* Main Single-Question Card */}
      <Card variant="default" className="shadow-lg border-2 border-sahay-warm-300 p-6 sm:p-8 space-y-6">
        <CardHeader className="p-0 space-y-4">
          <div className="flex items-center justify-between">
            <span className="p-3 rounded-2xl bg-sahay-navy-50 text-sahay-navy-900 border border-sahay-navy-100">
              <StepIcon className="w-7 h-7" />
            </span>

            {/* Read Aloud Button for Accessibility / Low-Literacy */}
            <button
              onClick={toggleAudioPlayback}
              type="button"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold bg-sahay-warm-100 text-sahay-navy-900 hover:bg-sahay-warm-200 border border-sahay-warm-300 min-h-[44px]"
              aria-label={isPlayingAudio ? t.common.stopAudio : t.common.readAloud}
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX className="w-5 h-5 text-red-600 animate-pulse" />
                  <span>{t.common.stopAudio}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-5 h-5 text-sahay-navy-800" />
                  <span>{t.common.readAloud}</span>
                </>
              )}
            </button>
          </div>

          {/* Question Title in Natural Phrasing */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-sahay-navy-950 leading-snug">
            {language === "hi" ? activeStep.titleHi : activeStep.titleEn}
          </h2>
          <p className="text-sm text-sahay-warm-800">
            {language === "hi"
              ? "आप नीचे दिए गए विकल्पों में से चुन सकते हैं या सीधे बोलकर बता सकते हैं।"
              : "You can tap an option below or speak your answer naturally."}
          </p>
        </CardHeader>

        <CardContent className="p-0 space-y-4">
          {/* Large Voice Recording Trigger Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={toggleVoiceRecording}
              className={`w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all min-h-[60px] ${
                isRecording
                  ? "bg-red-600 text-white shadow-voice animate-pulse"
                  : "bg-sahay-green-700 hover:bg-sahay-green-800 text-white shadow-md active:scale-[0.99]"
              }`}
              aria-pressed={isRecording}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-6 h-6" />
                  <span className="text-lg">{t.common.stopListening}</span>
                </>
              ) : (
                <>
                  <Mic className="w-6 h-6" />
                  <span className="text-lg">{t.common.speakNow}</span>
                </>
              )}
            </button>
            {isRecording && (
              <p className="text-center text-xs text-sahay-green-800 font-semibold mt-2 animate-pulse">
                {t.common.listening}
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-sahay-warm-300"></div>
            <span className="flex-shrink mx-4 text-xs font-bold text-sahay-warm-700 uppercase tracking-wider">
              {language === "hi" ? "या छूकर चुनें" : "Or tap to choose"}
            </span>
            <div className="flex-grow border-t border-sahay-warm-300"></div>
          </div>

          {/* Large Tap Targets (Options) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeStep.options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  if (currentStep < steps.length) {
                    setCurrentStep(currentStep + 1);
                  }
                }}
                className="p-4 rounded-xl border-2 border-sahay-warm-300 bg-white hover:bg-sahay-navy-50 hover:border-sahay-navy-700 text-left transition-all min-h-[56px] flex items-center justify-between text-base font-semibold text-sahay-navy-950 active:bg-sahay-navy-100"
              >
                <span>{option.label}</span>
                <CheckCircle className="w-5 h-5 text-sahay-warm-400 opacity-60" />
              </button>
            ))}
          </div>
        </CardContent>

        <CardFooter className="p-0 pt-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="md"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            className="flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.common.back}</span>
          </Button>

          {currentStep < steps.length ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => setCurrentStep(currentStep + 1)}
              className="flex items-center gap-2"
            >
              <span>{t.common.next}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Link href="/detailed">
              <Button variant="success" size="md" className="flex items-center gap-2">
                <span>{t.common.confirm}</span>
                <CheckCircle className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
