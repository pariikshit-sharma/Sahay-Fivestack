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
import {
  getSchemeTitle,
  getSchemeSummary,
  getSchemeDepartment,
  getSchemeBenefitDescription,
  getDocumentName,
  getRuleExplanation,
} from "@/core/languages/scheme-localization";
import { DocumentUploader } from "@/components/documents/DocumentUploader";
import { AutoApplyModal } from "@/components/schemes/AutoApplyModal";

export default function SimpleModePage() {
  const { t, language } = useApp();

  // Model engine selector: "auto" | "ollama" | "gemini"
  const [aiEngine, setAiEngine] = useState<"auto" | "ollama" | "gemini">("auto");
  const [aiRecommendation, setAiRecommendation] = useState<string | undefined>(undefined);
  const [engineUsed, setEngineUsed] = useState<"ollama" | "gemini" | "deterministic" | undefined>(undefined);

  // Wizard state: 'speak' | 'review' | 'results'
  const [phase, setPhase] = useState<"speak" | "review" | "results">("speak");
  const [transcript, setTranscript] = useState("");
  const [profile, setProfile] = useState<CitizenProfile>(DefaultCitizenProfile);
  const [extractedFields, setExtractedFields] = useState<string[]>([]);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [followUp, setFollowUp] = useState<ExtractionResult["suggestedFollowUp"]>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  const [matches, setMatches] = useState<SchemeEvaluationResult[]>([]);

  // Auto-apply modal state
  const [activeApplyScheme, setActiveApplyScheme] = useState<{ id: string; title: string; url: string } | null>(null);

  // Quick preset voice phrases for easy testing / quick tapping
  const quickPresets = [
    {
      label:
        language === "bn"
          ? "আমি পশ্চিমবঙ্গের কৃষক, ২ একর জমি আছে এবং বছরে ৮০ হাজার টাকা আয়।"
          : language === "ta"
          ? "நான் தமிழ்நாட்டைச் சேர்ந்த விவசாயி, 2 ஏக்கர் நிலம் உள்ளது, ஆண்டு வருமானம் ₹80,000."
          : language === "te"
          ? "నేను ఆంధ్రప్రదేశ్ రైతును, 2 ఎకరాల భూమి ఉంది, వార్షిక ఆదాయం ₹80,000."
          : language === "mr"
          ? "मी महाराष्ट्रातील शेतकरी आहे, २ एकर जमीन आहे आणि वार्षिक उत्पन्न ८० हजार आहे."
          : language === "gu"
          ? "હું ગુજરાતનો ખેડૂત છું, ૨ એકર જમીન છે અને વાર્ષિક આવક ૮૦ હજાર છે."
          : language === "kn"
          ? "ನಾನು ಕರ್ನಾಟಕದ ರೈತ, 2 ಎಕರೆ ಜಮೀನು ಇದೆ ಮತ್ತು ವಾರ್ಷಿಕ ಆದಾಯ ₹80,000."
          : language === "ml"
          ? "ഞാൻ കേരളത്തിലെ കർഷകനാണ്, 2 ഏക്കർ ഭൂമിയുണ്ട്, വാർഷിക വരുമാനം ₹80,000."
          : language === "pa"
          ? "ਮੈਂ ਪੰਜਾਬ ਦਾ ਕਿਸਾਨ ਹਾਂ, 2 ਏਕੜ ਜ਼ਮੀਨ ਹੈ ਅਤੇ ਸਾਲਾਨਾ 80 ਹਜ਼ਾਰ ਕਮਾਉਂਦਾ ਹਾਂ।"
          : language === "or"
          ? "ମୁଁ ଓଡ଼ିଶାର ଚାଷୀ, ୨ ଏକର ଜମି ଅଛି ଏବଂ ବାର୍ଷିକ ଆୟ ୮୦ ହଜାର।"
          : language === "ur"
          ? "میں کسان ہوں، 2 ایکڑ زمین ہے اور سالانہ آمدنی 80 ہزار ہے۔"
          : language === "en"
          ? "I am a farmer from Haryana with 2 acres of land earning ₹80,000."
          : "मैं हरियाणा का किसान हूँ, 2 एकड़ जमीन है और 80 हज़ार कमाता हूँ।",
      transcript:
        language === "bn"
          ? "আমি কৃষক, ২ একর চাষের জমি আছে এবং বছরে ৮০ হাজার টাকা আয়।"
          : language === "ta"
          ? "நான் விவசாயி, 2 ஏக்கர் விவசாய நிலம் உள்ளது மற்றும் ஆண்டு வருமானம் 80000."
          : language === "te"
          ? "నేను రైతును, 2 ఎకరాల వ్యవసాయ భూమి ఉంది మరియు వార్షిక ఆదాయం 80000."
          : language === "mr"
          ? "मी शेतकरी आहे, २ एकर शेतीची जमीन आहे आणि वार्षिक कमाई ८० हजार आहे."
          : language === "gu"
          ? "હું ખેડૂત છું, ૨ એકર જમીન છે અને વાર્ષિક આવક ૮૦ હજાર છે."
          : language === "kn"
          ? "ನಾನು ರೈತ, 2 ಎಕರೆ ಕೃಷಿ ಜಮೀನು ಇದೆ ಮತ್ತು ವಾರ್ಷಿಕ ಆದಾಯ 80000."
          : language === "ml"
          ? "ഞാൻ കർഷകനാണ്, 2 ഏക്കർ കൃഷിഭൂമിയുണ്ട്, വാർഷിക വരുമാനം 80000."
          : language === "pa"
          ? "ਮੈਂ ਕਿਸਾਨ ਹਾਂ, 2 ਏਕੜ ਜ਼ਮੀਨ ਹੈ ਅਤੇ ਸਾਲਾਨਾ 80 ਹਜ਼ਾਰ ਕਮਾਈ ਹੈ।"
          : language === "or"
          ? "ମୁଁ ଚାଷୀ, ୨ ଏକର ଚାଷଜମି ଅଛି ଏବଂ ବାର୍ଷିକ ଆୟ ୮୦ ହଜାର।"
          : language === "ur"
          ? "میں کسان ہوں، 2 ایکڑ زمین ہے اور سالانہ 80 ہزار کماتا ہوں۔"
          : language === "en"
          ? "I live in Haryana, work as a farmer, have 2 acres land and earn 80000."
          : "मैं हरियाणा से हूँ, खेती करता हूँ, 2 एकड़ जमीन है और सालाना 80 हज़ार कमाता हूँ।",
    },
    {
      label:
        language === "bn"
          ? "গর্ভবতী মহিলা, বয়স ২৪ বছর।"
          : language === "ta"
          ? "கர்ப்பிணிப் பெண், வயது 24."
          : language === "te"
          ? "గర్భిణీ స్త్రీ, వయస్సు 24 సంవత్సరాలు."
          : language === "mr"
          ? "गरोदर महिला, वय २४ वर्षे."
          : language === "gu"
          ? "સગર્ભા સ્ત્રી, ઉંમર ૨૪ વર્ષ."
          : language === "kn"
          ? "ಗರ್ಭಿಣಿ ಮಹಿಳೆ, ವಯಸ್ಸು 24 ವರ್ಷ."
          : language === "ml"
          ? "ഗർഭിണിയായ സ്ത്രീ, പ്രായം 24 വയസ്സ്."
          : language === "pa"
          ? "ਗਰਭਵਤੀ ਔਰਤ, ਉਮਰ 24 ਸਾਲ।"
          : language === "or"
          ? "ଗର୍ଭବତୀ ମହିଳା, ବୟସ ୨୪ ବର୍ଷ।"
          : language === "ur"
          ? "حاملہ خاتون، عمر 24 سال۔"
          : language === "en"
          ? "Pregnant woman, age 24."
          : "गर्भवती महिला, उम्र 24 वर्ष।",
      transcript:
        language === "bn"
          ? "আমি মহিলা, আমার বয়স ২৪ বছর এবং আমি গর্ভবতী।"
          : language === "ta"
          ? "நான் பெண், என் வயது 24 மற்றும் நான் கர்ப்பிணி."
          : language === "te"
          ? "నేను మహిళను, నా వయస్సు 24 సంవత్సరాలు మరియు నేను గర్భిణీని."
          : language === "mr"
          ? "मी महिला आहे, माझे वय २४ वर्षे आहे आणि मी गरोदर आहे."
          : language === "gu"
          ? "હું મહિલા છું, મારી ઉંમર ૨૪ વર્ષ છે અને હું સગર્ભા છું."
          : language === "kn"
          ? "ನಾನು ಮಹಿಳೆ, ನನ್ನ ವಯಸ್ಸು 24 ವರ್ಷ ಮತ್ತು ನಾನು ಗರ್ಭಿಣಿ."
          : language === "ml"
          ? "ഞാൻ സ്ത്രീയാണ്, എന്റെ പ്രായം 24 വയസ്സ്, ഞാൻ ഗർഭിണിയാണ്."
          : language === "pa"
          ? "ਮੈਂ ਔਰਤ ਹਾਂ, ਮੇਰੀ ਉਮਰ 24 ਸਾਲ ਹੈ ਅਤੇ ਮੈਂ ਗਰਭਵਤੀ ਹਾਂ।"
          : language === "or"
          ? "ମୁଁ ମହିଳା, ମୋର ବୟସ ୨୪ ବର୍ଷ ଏବଂ ମୁଁ ଗର୍ଭବତୀ।"
          : language === "ur"
          ? "میں خاتون ہوں، میری عمر 24 سال ہے اور میں حاملہ ہوں۔"
          : language === "en"
          ? "I am a female, my age is 24 years and I am pregnant."
          : "मैं उत्तर प्रदेश से महिला हूँ, मेरी उम्र 24 साल है और मैं गर्भवती हूँ।",
    },
    {
      label:
        language === "bn"
          ? "দিনমজুর, বার্ষিক আয় ১.২ লাখ।"
          : language === "ta"
          ? "தினக்கூலி தொழிலாளி, ஆண்டு வருமானம் ₹1.2 லட்சம்."
          : language === "te"
          ? "దినసరి కూలీ, వార్షిక ఆదాయం ₹1.2 లక్షలు."
          : language === "mr"
          ? "मजूर, वार्षिक उत्पन्न १.२ लाख."
          : language === "gu"
          ? "દૈનિક મજૂર, વાર્ષિક આવક ૧.૨ લાખ."
          : language === "kn"
          ? "ದಿನಗೂಲಿ ಕಾರ್ಮಿಕ, ವಾರ್ಷಿಕ ಆದಾಯ ₹1.2 ಲಕ್ಷ."
          : language === "ml"
          ? "ദിവസവേതന തൊഴിലാളി, വാർഷിക വരുമാനം ₹1.2 ലക്ഷം."
          : language === "pa"
          ? "ਦਿਹਾੜੀਦਾਰ ਮਜ਼ਦੂਰ, ਸਾਲਾਨਾ ਆਮਦਨ 1.2 ਲੱਖ।"
          : language === "or"
          ? "ଦିନମଜୁରିଆ, ବାର୍ଷିକ ଆୟ ୧.୨ ଲକ୍ଷ।"
          : language === "ur"
          ? "دیہاڑی دار مزدور، سالانہ آمدنی 1.2 لاکھ۔"
          : language === "en"
          ? "Daily wage worker, annual income ₹1.2 Lakh."
          : "दैनिक मजदूर, आय 1.2 लाख।",
      transcript:
        language === "bn"
          ? "আমি দিনমজুরি করি এবং বছরে ১ লাখ ২০ হাজার টাকা আয় করি।"
          : language === "ta"
          ? "நான் தினக்கூலி வேலை செய்கிறேன், ஆண்டு வருமானம் 120000."
          : language === "te"
          ? "నేను దినసరి కూలీని, ఏడాదికి 120000 సంపాదిస్తాను."
          : language === "mr"
          ? "मी मजुरी करतो आणि वर्षाला १ लाख २० हजार कमावतो."
          : language === "gu"
          ? "હું મજૂરી કરું છું અને વાર્ષિક ૧ લાખ ૨૦ હજાર કમાઉં છું."
          : language === "kn"
          ? "ನಾನು ದಿನಗೂಲಿ ಕೆಲಸ ಮಾಡುತ್ತೇನೆ, ವಾರ್ಷಿಕ 120000 ಆದಾಯವಿದೆ."
          : language === "ml"
          ? "ഞാൻ ദിവസവേതന തൊഴിലാളിയാണ്, വർഷത്തിൽ 120000 വരുമാനമുണ്ട്."
          : language === "pa"
          ? "ਮੈਂ ਦਿਹਾੜੀ ਮਜ਼ਦૂਰੀ ਕਰਦਾ ਹਾਂ ਅਤੇ ਸਾਲਾਨਾ 1 ਲੱਖ 20 ਹਜ਼ਾਰ ਕਮਾਉਂਦਾ ਹਾਂ।"
          : language === "or"
          ? "ମୁଁ ଦିନମଜୁରି କରେ ଏବଂ ବର୍ଷକୁ ୧ ଲକ୍ଷ ୨୦ ହଜାର ରୋଜଗାର କରେ।"
          : language === "ur"
          ? "میں دیہاڑی مزدوری کرتا ہوں اور سالانہ 1 لاکھ 20 ہزار کماتا ہوں۔"
          : language === "en"
          ? "I work as a daily wage worker and earn 120000 per year."
          : "मैं दिल्ली में रहता हूँ, दिहाड़ी मजदूरी करता हूँ और पूरे साल में 1 लाख 20 हज़ार कमाता हूँ।",
    },
  ];

  // Process transcript into structured profile
  const handleTranscriptReceived = async (text: string) => {
    setTranscript(text);
    setIsProcessing(true);

    try {
      const res = await fetch("/api/v1/profile/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: text,
          currentProfile: profile,
          engine: aiEngine,
          language,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setProfile(result.profile);
        setExtractedFields(result.extractedFields || []);
        setMissingFields(result.missingCriticalFields || []);
        setFollowUp(result.suggestedFollowUp);
        setAiRecommendation(result.aiRecommendation);
        setEngineUsed(result.engineUsed);
      } else {
        const result = await extractCitizenProfile(text, profile, aiEngine, language);
        setProfile(result.profile);
        setExtractedFields(result.extractedFields);
        setMissingFields(result.missingCriticalFields);
        setFollowUp(result.suggestedFollowUp);
        setAiRecommendation(result.aiRecommendation);
        setEngineUsed(result.engineUsed);
      }
      setPhase("review");
    } catch {
      const result = await extractCitizenProfile(text, profile, aiEngine, language);
      setProfile(result.profile);
      setExtractedFields(result.extractedFields);
      setMissingFields(result.missingCriticalFields);
      setFollowUp(result.suggestedFollowUp);
      setAiRecommendation(result.aiRecommendation);
      setEngineUsed(result.engineUsed);
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
    setAiRecommendation(undefined);
    setEngineUsed(undefined);
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
                  language === "en"
                    ? "Namaste! Speak naturally about where you live, what work you do, and your income."
                    : `${t.simpleMode.welcomeTitle} ${t.simpleMode.welcomeSubtitle}`
                }
              />
            </div>

            <CardTitle className="text-2xl sm:text-3xl font-extrabold text-sahay-navy-950">
              {t.simpleMode.welcomeTitle}
            </CardTitle>
            <CardDescription className="text-base text-sahay-warm-900">
              {t.simpleMode.welcomeSubtitle}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 space-y-6">
            {/* AI Model Brain Selector */}
            <div className="p-3 bg-sahay-warm-50 rounded-2xl border border-sahay-warm-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-sahay-navy-950 font-bold">
                <Sparkles className="w-4 h-4 text-sahay-green-700" />
                <span>AI Language Brain:</span>
              </div>
              <div className="inline-flex rounded-xl p-1 bg-sahay-warm-200/80 border border-sahay-warm-300">
                <button
                  type="button"
                  onClick={() => setAiEngine("auto")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    aiEngine === "auto"
                      ? "bg-white text-sahay-navy-950 shadow-sm"
                      : "text-sahay-navy-700 hover:text-sahay-navy-950"
                  }`}
                >
                  ⚡ Auto (Recommended)
                </button>
                <button
                  type="button"
                  onClick={() => setAiEngine("ollama")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    aiEngine === "ollama"
                      ? "bg-white text-sahay-navy-950 shadow-sm"
                      : "text-sahay-navy-700 hover:text-sahay-navy-950"
                  }`}
                >
                  💻 Local Ollama (Offline)
                </button>
                <button
                  type="button"
                  onClick={() => setAiEngine("gemini")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    aiEngine === "gemini"
                      ? "bg-white text-sahay-navy-950 shadow-sm"
                      : "text-sahay-navy-700 hover:text-sahay-navy-950"
                  }`}
                >
                  ☁️ Google Gemini API
                </button>
              </div>
            </div>

            {/* Primary Voice Action Button */}
            <VoiceInputButton
              onTranscript={(text) => {
                // Real-time transcript sync: Every single word you speak appears immediately in the text box below
                setTranscript(text);
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
                {language === "en" ? "Quick Examples (Tap to test):" : "त्वरित उदाहरण (छूकर चुनें):"}
              </span>
              <div className="space-y-2">
                {quickPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleTranscriptReceived(preset.transcript)}
                    className="w-full text-left p-3.5 rounded-xl border border-sahay-warm-300 bg-sahay-warm-50 hover:bg-sahay-warm-100 hover:border-sahay-navy-600 transition-all text-sm font-medium text-sahay-navy-900 flex items-center justify-between"
                  >
                    <span>{preset.label}</span>
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
            <div className="p-3.5 rounded-xl bg-sahay-warm-100 border border-sahay-warm-200 text-xs sm:text-sm text-sahay-navy-950 italic flex items-start justify-between gap-3">
              <div>
                <span className="font-bold not-italic text-sahay-navy-800 mr-1.5">
                  {language === "hi" ? "आपकी बात:" : "Your Input:"}
                </span>
                <span>"{transcript}"</span>
              </div>
              <ReadAloudButton textToRead={transcript} />
            </div>

            {/* AI Demands Understanding & Recommendation */}
            {aiRecommendation && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300 space-y-3 shadow-sm">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-700 animate-pulse" />
                    <span className="font-extrabold text-sahay-navy-950 text-sm">
                      {language === "hi"
                        ? "एआई समझ व योजना सिफारिश (AI Voice Understanding)"
                        : "AI Demands Understanding & Recommendation"}
                    </span>
                  </div>
                  <Badge
                    variant={engineUsed === "ollama" ? "success" : "navy"}
                    size="sm"
                    className="font-bold text-xs"
                  >
                    {engineUsed === "ollama"
                      ? "💻 Local Ollama (Offline)"
                      : engineUsed === "gemini"
                      ? "☁️ Google Gemini"
                      : "⚡ Deterministic AST"}
                  </Badge>
                </div>

                <p className="text-sm sm:text-base font-semibold text-sahay-navy-950 leading-relaxed bg-white/80 p-3.5 rounded-xl border border-emerald-200">
                  {aiRecommendation}
                </p>

                <div className="flex items-center justify-between pt-1 text-xs text-emerald-900">
                  <span className="font-medium">
                    {language === "hi"
                      ? "नीचे प्रामाणिक सरकारी नियमों द्वारा आपकी पात्रता जांची गई है:"
                      : "Verified against official central & state eligibility criteria:"}
                  </span>
                  <ReadAloudButton textToRead={aiRecommendation} />
                </div>
              </div>
            )}

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
                        {getSchemeTitle(res.scheme, language)}
                      </h3>
                      <p className="text-xs text-sahay-warm-700 font-medium">
                        {getSchemeDepartment(res.scheme, language)}
                      </p>
                    </div>

                    {/* Benefit amount */}
                    {res.scheme.benefitAmountMax && (
                      <div className="p-3 bg-sahay-green-100/70 border border-sahay-green-300 rounded-xl text-left sm:text-right flex-shrink-0">
                        <div className="text-xs text-sahay-green-950 font-semibold">
                          {language === "en" ? "Benefit Amount:" : "योजना का लाभ:"}
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
                          language === "en" ? res.rationaleSummaryEn : res.rationaleSummaryHi
                        }
                      />
                    </div>
                    <p className="text-sm sm:text-base font-semibold text-sahay-navy-900">
                      {language === "en" ? res.rationaleSummaryEn : res.rationaleSummaryHi}
                    </p>

                    {/* List of passed criteria */}
                    {res.passedCriteria.length > 0 && (
                      <div className="pt-1 space-y-1">
                        {res.passedCriteria.map((c, i) => {
                          const matchedRule = res.scheme.rules.find((r) => r.id === c.ruleId);
                          const expl = matchedRule ? getRuleExplanation(matchedRule, language) : (language === "en" ? c.explanationEn : c.explanationHi);
                          return (
                            <div key={i} className="text-xs text-sahay-green-900 flex items-center gap-1.5 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 text-sahay-green-700 flex-shrink-0" />
                              <span>{expl}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Missing criteria if any */}
                    {res.missingCriteria.length > 0 && (
                      <div className="pt-2 border-t border-sahay-warm-200 space-y-1">
                        <span className="text-xs font-bold text-amber-900">
                          {t.simpleMode.missingInfoTitle}:
                        </span>
                        {res.missingCriteria.map((m, i) => {
                          const matchedRule = res.scheme.rules.find((r) => r.id === m.ruleId);
                          const expl = matchedRule ? getRuleExplanation(matchedRule, language) : (language === "en" ? m.explanationEn : m.explanationHi);
                          return (
                            <div key={i} className="text-xs text-amber-800 flex items-center gap-1.5 font-medium">
                              <HelpCircle className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                              <span>{expl}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Required Documents Matrix & Document Uploader */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-sahay-navy-950 uppercase tracking-wider flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-sahay-navy-800" />
                      <span>{t.detailedMode.documentsRequired} & Upload</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {res.scheme.documents.map((doc) => (
                        <span
                          key={doc.id}
                          className="text-xs px-2.5 py-1 rounded-lg bg-white border border-sahay-warm-300 text-sahay-navy-900 font-medium"
                        >
                          ✓ {getDocumentName(doc, language)}
                        </span>
                      ))}
                    </div>

                    {/* Integrated Document Uploader for this Scheme */}
                    {isEligible && (
                      <div className="pt-2">
                        <DocumentUploader
                          requiredDocType={getDocumentName(res.scheme.documents[0] || { nameEn: "Aadhaar Card" }, language)}
                          schemeId={res.scheme.id}
                          schemeTitle={getSchemeTitle(res.scheme, language)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions: One-Click Auto Apply + Official Portal */}
                  <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-sahay-warm-200">
                    <span className="text-xs text-sahay-warm-700 font-mono">
                      Verified Gazette Provenance
                    </span>
                    
                    <div className="flex items-center gap-2">
                      {isEligible && (
                        <button
                          type="button"
                          onClick={() =>
                            setActiveApplyScheme({
                              id: res.scheme.id,
                              title: getSchemeTitle(res.scheme, language),
                              url: res.scheme.officialPortalUrl,
                            })
                          }
                          className="px-4 py-2 rounded-xl bg-sahay-green-700 hover:bg-sahay-green-800 text-white font-bold text-sm shadow transition-all flex items-center gap-1.5 min-h-[44px]"
                        >
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>Apply Now (Pre-fill)</span>
                        </button>
                      )}

                      <a
                        href={res.scheme.officialPortalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm" className="flex items-center gap-2 min-h-[44px]">
                          <span>{t.simpleMode.applyOfficial}</span>
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Modal for Auto Apply */}
          {activeApplyScheme && (
            <AutoApplyModal
              schemeId={activeApplyScheme.id}
              schemeTitle={activeApplyScheme.title}
              officialPortalUrl={activeApplyScheme.url}
              profile={profile}
              isOpen={!!activeApplyScheme}
              onClose={() => setActiveApplyScheme(null)}
            />
          )}
        </div>
      )}
    </div>
  );
}
