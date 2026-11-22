import { CitizenProfile, DefaultCitizenProfile } from "@/types/citizen";

export interface ExtractionResult {
  profile: CitizenProfile;
  extractedFields: string[];
  missingCriticalFields: string[];
  suggestedFollowUp?: {
    field: string;
    questionHi: string;
    questionEn: string;
  };
  aiRecommendation?: string;
  engineUsed?: "ollama" | "gemini" | "deterministic";
}

// Indian state keyword mappings
const STATE_MAP: Record<string, string> = {
  // Hindi & English
  हरियाणा: "IN-HR",
  haryana: "IN-HR",
  "उत्तर प्रदेश": "IN-UP",
  up: "IN-UP",
  "uttar pradesh": "IN-UP",
  दिल्ली: "IN-DL",
  delhi: "IN-DL",
  बिहार: "IN-BR",
  bihar: "IN-BR",
  "मध्य प्रदेश": "IN-MP",
  mp: "IN-MP",
  "madhya pradesh": "IN-MP",
  राजस्थान: "IN-RJ",
  rajasthan: "IN-RJ",
  पंजाब: "IN-PB",
  punjab: "IN-PB",
  महाराष्ट्र: "IN-MH",
  maharashtra: "IN-MH",
  गुजरात: "IN-GJ",
  gujarat: "IN-GJ",
  "पश्चिम बंगाल": "IN-WB",
  bengal: "IN-WB",
  "west bengal": "IN-WB",
  পশ্চিমবঙ্গ: "IN-WB",
  தமிழ்நாடு: "IN-TN",
  "tamil nadu": "IN-TN",
  ஆந்திரா: "IN-AP",
  ఆంధ్రప్రదేశ్: "IN-AP",
  "andhra pradesh": "IN-AP",
  తెలంగాణ: "IN-TG",
  telangana: "IN-TG",
  ಕರ್ನಾಟಕ: "IN-KA",
  karnataka: "IN-KA",
  കേരളം: "IN-KL",
  kerala: "IN-KL",
  ଓଡ଼ିଶା: "IN-OR",
  odisha: "IN-OR",
  ਪੰਜਾਬ: "IN-PB",
  مہاراشٹر: "IN-MH",
};

// Multilingual occupation keywords
const FARMER_KEYWORDS = [
  "किसान", "खेती", "kisan", "farmer", "agriculture", "কৃষক", "চাষ", "விவசாயி", "రైతు",
  "शेतकरी", "ખેડૂત", "ರೈತ", "കർഷകൻ", "କୃଷକ", "ଚାଷୀ", "کسان", "کھیتی"
];

const DAILY_WAGE_KEYWORDS = [
  "मजदूर", "मजदूरी", "दिहाड़ी", "daily wage", "labor", "labour", "দিনমজুর", "கூலி",
  "కూలీ", "मजूर", "મજૂર", "ದಿನಗೂಲಿ", "തൊഴിലാളി", "ਦਿਹਾੜੀ", "ଦିନମଜୁରି", "مزدور"
];

const VENDOR_KEYWORDS = [
  "रेहड़ी", "दुकान", "ठेला", "vendor", "shop", "দোকান", "வியாபாரி", "వ్యాపారి",
  "दुकानदार", "દુકાનદાર", "ಅಂಗಡಿ", "വ്യാപാരി", "ਦੁਕਾਨਦਾਰ", "ଦୋକାନୀ", "دکاندار"
];

const STUDENT_KEYWORDS = [
  "छात्र", "विद्यार्थी", "student", "study", "ছাত্র", "மாணவர்", "విద్యార్థి",
  "ವಿದ್ಯಾರ್ಥಿ", "വിദ്യാർത്ഥി", "ਵਿਦਿਆਰਥੀ", "ଛାତ୍ର", "طالب علم"
];

const PREGNANT_KEYWORDS = [
  "गर्भवती", "pregnant", "स्तनपान", "दूध पिलाती", "बच्चा होने वाला", "গর্ভবতী",
  "கர்ப்பிணி", "గర్భిణీ", "गरोदर", "સગર્ભા", "ಗರ್ಭಿಣಿ", "ഗർഭിണി", "ਗਰਭਵਤੀ", "ଗର୍ଭବତୀ", "حاملہ"
];

const FEMALE_KEYWORDS = [
  "महिला", "औरत", "female", "woman", "स्त्री", "মহিলা", "பெண்", "మహిళ", "സ്ത്രീ", "ਮਹਿਲਾ", "ମହିଳା", "خاتون"
];

/**
 * Deterministic local fallback extractor.
 * 100% Free, zero external API keys needed, works offline and instantly!
 */
export function extractProfileDeterministic(
  transcript: string,
  existingProfile: CitizenProfile = DefaultCitizenProfile
): ExtractionResult {
  const text = transcript.toLowerCase();
  const profile: CitizenProfile = { ...existingProfile };
  const extractedFields: string[] = [];

  // 1. State detection
  for (const [key, code] of Object.entries(STATE_MAP)) {
    if (text.includes(key)) {
      profile.state = code;
      extractedFields.push("state");
      break;
    }
  }

  // 2. Occupation detection (Multilingual)
  if (FARMER_KEYWORDS.some((kw) => text.includes(kw))) {
    profile.occupation = "farmer";
    extractedFields.push("occupation");
  } else if (DAILY_WAGE_KEYWORDS.some((kw) => text.includes(kw))) {
    profile.occupation = "daily_wage_worker";
    extractedFields.push("occupation");
  } else if (VENDOR_KEYWORDS.some((kw) => text.includes(kw))) {
    profile.occupation = "street_vendor";
    extractedFields.push("occupation");
  } else if (STUDENT_KEYWORDS.some((kw) => text.includes(kw))) {
    profile.occupation = "student";
    extractedFields.push("occupation");
  }

  // Helper to convert Indian numeric words/digits across scripts
  const normalizeDigits = (str: string) => {
    return str
      .replace(/[০-৯]/g, (d) => String(d.charCodeAt(0) - 2534)) // Bengali
      .replace(/[౦-౯]/g, (d) => String(d.charCodeAt(0) - 3168)) // Telugu
      .replace(/[௦-௯]/g, (d) => String(d.charCodeAt(0) - 3040)) // Tamil
      .replace(/[೦-೯]/g, (d) => String(d.charCodeAt(0) - 3302)) // Kannada
      .replace(/[൦-൯]/g, (d) => String(d.charCodeAt(0) - 3430)) // Malayalam
      .replace(/[੦-੯]/g, (d) => String(d.charCodeAt(0) - 2672)) // Gurmukhi
      .replace(/[୦-୯]/g, (d) => String(d.charCodeAt(0) - 2918)) // Odia
      .replace(/[૦-૯]/g, (d) => String(d.charCodeAt(0) - 2790)) // Gujarati
      .replace(/[०-९]/g, (d) => String(d.charCodeAt(0) - 2406)); // Devanagari
  };

  const normalizedText = normalizeDigits(text);

  // 3. Landholding detection (Acres) - Multilingual
  const landRegex = /(\d+(?:\.\d+)?)\s*(?:एकड़|एकर|acre|acres|किले|किला|একর|ஏக்கர்|ఎకరాలు|ఎకరాల|ಎಕರೆ|ഏക്കർ|ਏਕੜ|ଏକର|ایکڑ)/i;
  const landMatch = normalizedText.match(landRegex);
  if (landMatch) {
    profile.landholdingAcres = parseFloat(landMatch[1]);
    extractedFields.push("landholdingAcres");
  } else if (
    text.includes("जमीन नहीं") ||
    text.includes("landless") ||
    text.includes("ভূমিহীন") ||
    text.includes("நிலமில்லை") ||
    text.includes("భూమి లేదు") ||
    text.includes("જમીન નથી")
  ) {
    profile.landholdingAcres = 0;
    extractedFields.push("landholdingAcres");
  }

  // 4. Income detection (Handling Lakh, Thousand across languages)
  const lakhRegex = /(\d+(?:\.\d+)?)\s*(?:लाख|lakh|lac|লাখ|லட்சம்|లక్ష|લાખ|ಲಕ್ಷ|ലക്ഷം|ਲੱਖ|ଲକ୍ଷ|لاکھ)/i;
  const lakhMatch = normalizedText.match(lakhRegex);
  if (lakhMatch) {
    profile.annualHouseholdIncome = parseFloat(lakhMatch[1]) * 100000;
    extractedFields.push("annualHouseholdIncome");
  } else {
    const hazarRegex = /(\d+(?:\.\d+)?)\s*(?:हज़ार|हजार|thousand|k|হাজার|ஆயிரம்|వేల|हजार|હજાર|ಸಾವಿರ|ആയിരം|ਹਜ਼ਾਰ|ହଜାର|ہزار)/i;
    const hazarMatch = normalizedText.match(hazarRegex);
    if (hazarMatch) {
      profile.annualHouseholdIncome = parseFloat(hazarMatch[1]) * 1000;
      extractedFields.push("annualHouseholdIncome");
    } else {
      const rawNumIncomeRegex = /(?:कमाई|आय|income|कमाते|রোজগার|வருமானம்|ఆదాయం|ఉత్పన్న|આવક|ಆದಾಯ|വരുമാനം|ਕਮਾਈ|ଆୟ|آمدنی)\D{0,15}(\d{4,7})/i;
      const rawMatch = normalizedText.match(rawNumIncomeRegex);
      if (rawMatch) {
        profile.annualHouseholdIncome = parseInt(rawMatch[1], 10);
        extractedFields.push("annualHouseholdIncome");
      }
    }
  }

  // 5. Age detection - Multilingual
  const ageRegex = /(\d{1,2})\s*(?:साल|वर्ष|years|year|उम्र|age|বছর|வயது|సంవత్సరాలు|ವರ್ಷ|വയസ്സ്|ਸਾਲ|ବର୍ଷ|سال)/i;
  const ageMatch = normalizedText.match(ageRegex);
  if (ageMatch) {
    const ageVal = parseInt(ageMatch[1], 10);
    if (ageVal >= 1 && ageVal <= 110) {
      profile.age = ageVal;
      extractedFields.push("age");
    }
  }

  // 6. Gender & Maternity detection - Multilingual
  if (PREGNANT_KEYWORDS.some((kw) => text.includes(kw))) {
    profile.gender = "female";
    profile.isPregnantOrLactating = true;
    extractedFields.push("gender", "isPregnantOrLactating");
  } else if (FEMALE_KEYWORDS.some((kw) => text.includes(kw))) {
    profile.gender = "female";
    extractedFields.push("gender");
  } else if (
    text.includes("पुरुष") ||
    text.includes("आदमी") ||
    text.includes("male") ||
    text.includes("man") ||
    text.includes("পুরুষ") ||
    text.includes("ஆண்") ||
    text.includes("పురుషుడు") ||
    text.includes("ಪುರುಷ") ||
    text.includes("പുരുഷൻ") ||
    text.includes("ਪੁਰਸ਼") ||
    text.includes("ପୁରୁଷ") ||
    text.includes("مرد")
  ) {
    profile.gender = "male";
    extractedFields.push("gender");
  }

  // Identify critical missing fields
  const missingCriticalFields: string[] = [];
  if (!profile.state) missingCriticalFields.push("state");
  if (!profile.occupation) missingCriticalFields.push("occupation");
  if (profile.annualHouseholdIncome === null) missingCriticalFields.push("annualHouseholdIncome");

  // If farmer, landholding is critical
  if (profile.occupation === "farmer" && profile.landholdingAcres === null) {
    missingCriticalFields.push("landholdingAcres");
  }

  // Formulate a single, polite follow-up question
  let suggestedFollowUp: ExtractionResult["suggestedFollowUp"] = undefined;
  if (missingCriticalFields.includes("state")) {
    suggestedFollowUp = {
      field: "state",
      questionHi: "आप किस राज्य या केंद्र शासित प्रदेश में रहते हैं?",
      questionEn: "Which state or union territory do you live in?",
    };
  } else if (missingCriticalFields.includes("occupation")) {
    suggestedFollowUp = {
      field: "occupation",
      questionHi: "आप मुख्य रूप से क्या काम करते हैं?",
      questionEn: "What is your primary occupation or source of work?",
    };
  } else if (missingCriticalFields.includes("landholdingAcres")) {
    suggestedFollowUp = {
      field: "landholdingAcres",
      questionHi: "आपके पास खेती की लगभग कितने एकड़ जमीन है?",
      questionEn: "Approximately how many acres of agricultural land do you own?",
    };
  } else if (missingCriticalFields.includes("annualHouseholdIncome")) {
    suggestedFollowUp = {
      field: "annualHouseholdIncome",
      questionHi: "आपके परिवार की कुल सालाना कमाई लगभग कितनी है?",
      questionEn: "Approximately how much does your entire household earn annually?",
    };
  }

  return {
    profile,
    extractedFields: Array.from(new Set(extractedFields)),
    missingCriticalFields,
    suggestedFollowUp,
  };
}

/**
 * Local Ollama Model Extractor.
 * Connects directly to local Ollama daemon (127.0.0.1:11434) using local qwen2.5:0.5b.
 * 100% private, offline, runs on GPU/CPU with zero internet needed.
 */
async function extractWithOllama(
  transcript: string,
  existingProfile: CitizenProfile = DefaultCitizenProfile,
  language: string = "hi"
): Promise<{ profile: CitizenProfile; recommendation?: string } | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const prompt = `You are SAHAY, an Indian public welfare schemes assistant.
A citizen spoke their situation: "${transcript}"

Extract their parameters into JSON matching this exact structure:
{
  "profile": {
    "age": null,
    "gender": null,
    "state": null,
    "occupation": null,
    "annualHouseholdIncome": null,
    "landholdingAcres": null,
    "isPregnantOrLactating": null
  },
  "recommendation": "A friendly, compassionate 2-sentence conversational understanding in simple ${language === "en" ? "English" : "Hindi"} explaining what benefits or schemes they can receive."
}

Rules:
- state must be an ISO-3166-2:IN code (like "IN-HR", "IN-UP", "IN-DL", "IN-BR", "IN-MP", "IN-MH", "IN-GJ", "IN-WB", "IN-TN", "IN-AP", "IN-TG", "IN-KA", "IN-KL", "IN-PB", "IN-OR") or null.
- occupation must be one of: "farmer", "daily_wage_worker", "street_vendor", "student", "unemployed", "self_employed", "salaried", "homemaker", "other", or null.
- annualHouseholdIncome in INR (e.g. 80000 for 80 हज़ार).
- landholdingAcres in numeric acres.
- Output strictly JSON only.`;

    const response = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen2.5:0.5b",
        prompt,
        stream: false,
        format: "json",
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.response) return null;

    const parsed = JSON.parse(data.response);
    const p = parsed.profile || parsed;
    let recommendation: string | undefined = parsed.recommendation || undefined;

    const merged: CitizenProfile = {
      ...existingProfile,
      ...(p.age !== undefined && p.age !== null ? { age: Number(p.age) } : {}),
      ...(p.gender ? { gender: p.gender } : {}),
      ...(p.state ? { state: p.state } : {}),
      ...(p.occupation ? { occupation: p.occupation } : {}),
      ...(p.annualHouseholdIncome !== undefined && p.annualHouseholdIncome !== null
        ? { annualHouseholdIncome: Number(p.annualHouseholdIncome) }
        : {}),
      ...(p.landholdingAcres !== undefined && p.landholdingAcres !== null
        ? { landholdingAcres: Number(p.landholdingAcres) }
        : {}),
      ...(p.isPregnantOrLactating !== undefined && p.isPregnantOrLactating !== null
        ? { isPregnantOrLactating: Boolean(p.isPregnantOrLactating) }
        : {}),
    };

    // If small model repeated prompt placeholder text, generate tailored grounded recommendation
    if (
      !recommendation ||
      recommendation.includes("conversational understanding") ||
      recommendation.includes("compassionate") ||
      recommendation.length < 15
    ) {
      if (merged.occupation === "farmer") {
        recommendation =
          language === "en"
            ? `As a farmer owning land, you are a prime candidate for PM-KISAN (₹6,000/yr support) and Pradhan Mantri Fasal Bima Yojana.`
            : `किसान भाई, आपकी कृषि भूमि और स्थिति के आधार पर आप पीएम-किसान सम्मान निधि (₹6,000 वार्षिक) और फसल सुरक्षा योजनाओं के पात्र हैं।`;
      } else if (merged.isPregnantOrLactating) {
        recommendation =
          language === "en"
            ? `Under national maternal welfare programs, you qualify for PMMVY (₹5,000 maternity financial support) and free healthcare.`
            : `मातृ वंदन योजना (PMMVY) के तहत आपको ₹5,000 की वित्तीय सहायता व सरकारी अस्पताल में निःशुल्क पोषण व देखभाल प्राप्त होगी।`;
      } else if (merged.occupation === "street_vendor") {
        recommendation =
          language === "en"
            ? `Under PM SVANidhi, you are eligible for micro-credit working capital loans up to ₹50,000 with 7% interest subsidy.`
            : `पीएम स्वनिधि योजना के तहत आपको व्यापार बढ़ाने हेतु ₹50,000 तक का आसान कार्यशील पूंजी ऋण व ब्याज सब्सिडी प्राप्त हो सकती है।`;
      } else {
        recommendation =
          language === "en"
            ? `Based on your stated occupation and income, you qualify for verified government welfare and health coverage schemes.`
            : `आपकी आय और कार्य विवरण के अनुसार आप सरकारी स्वास्थ्य सुरक्षा और आजीविका सहायता योजनाओं के लिए पात्र हैं।`;
      }
    }

    return { profile: merged, recommendation };
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn("[Ollama Extraction Warning]:", err);
    return null;
  }
}

/**
 * Google Gemini Cloud Model Extractor.
 * Connects to Google Generative Language API using gemini-3.5-flash-lite / gemini-3.8-flash.
 */
async function extractWithGemini(
  transcript: string,
  existingProfile: CitizenProfile = DefaultCitizenProfile,
  language: string = "hi"
): Promise<{ profile: CitizenProfile; recommendation?: string } | null> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) return null;

  const models = ["gemini-3.5-flash-lite", "gemini-3.8-flash"];

  const prompt = `You are SAHAY, an Indian public welfare discovery platform.
A citizen spoke their situation: "${transcript}"

Extract their parameters into JSON matching this exact structure:
{
  "profile": {
    "age": null,
    "gender": null,
    "state": null,
    "occupation": null,
    "annualHouseholdIncome": null,
    "landholdingAcres": null,
    "isPregnantOrLactating": null
  },
  "recommendation": "A friendly, compassionate 2-sentence conversational understanding in simple ${language === "en" ? "English" : "Hindi"} explaining what government benefits fit their demands."
}

Rules:
- state must be an ISO-3166-2:IN code (like "IN-HR", "IN-UP", "IN-DL", "IN-BR", "IN-MP", "IN-MH", "IN-GJ", "IN-WB", "IN-TN", "IN-AP", "IN-TG", "IN-KA", "IN-KL", "IN-PB", "IN-OR") or null.
- occupation must be one of: "farmer", "daily_wage_worker", "street_vendor", "student", "unemployed", "self_employed", "salaried", "homemaker", "other", or null.
- annualHouseholdIncome in INR (e.g. 80000 for 80 हज़ार).
- landholdingAcres in numeric acres.
- Output strictly JSON only.`;

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        }
      );

      if (!response.ok) continue;

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) continue;

      const cleanJson = content.replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(cleanJson);
      const p = parsed.profile || parsed;
      const recommendation = parsed.recommendation || undefined;

      const merged: CitizenProfile = {
        ...existingProfile,
        ...(p.age !== undefined && p.age !== null ? { age: Number(p.age) } : {}),
        ...(p.gender ? { gender: p.gender } : {}),
        ...(p.state ? { state: p.state } : {}),
        ...(p.occupation ? { occupation: p.occupation } : {}),
        ...(p.annualHouseholdIncome !== undefined && p.annualHouseholdIncome !== null
          ? { annualHouseholdIncome: Number(p.annualHouseholdIncome) }
          : {}),
        ...(p.landholdingAcres !== undefined && p.landholdingAcres !== null
          ? { landholdingAcres: Number(p.landholdingAcres) }
          : {}),
        ...(p.isPregnantOrLactating !== undefined && p.isPregnantOrLactating !== null
          ? { isPregnantOrLactating: Boolean(p.isPregnantOrLactating) }
          : {}),
      };

      return { profile: merged, recommendation };
    } catch (err) {
      console.warn(`[Gemini Extraction ${model} Warning]:`, err);
    }
  }

  return null;
}

/**
 * Universal Profile Extraction entry point.
 * Supports:
 * - "ollama": Uses local Ollama model (qwen2.5:0.5b) on 127.0.0.1:11434 (offline, GPU/CPU).
 * - "gemini": Uses Google Gemini API (gemini-3.5-flash-lite / gemini-3.8-flash).
 * - "auto": Tries local Ollama first; if unavailable, uses Gemini API; falls back to Deterministic.
 */
export async function extractCitizenProfile(
  transcript: string,
  existingProfile: CitizenProfile = DefaultCitizenProfile,
  engineChoice: "auto" | "ollama" | "gemini" = "auto",
  language: string = "hi"
): Promise<ExtractionResult> {
  let aiResult: { profile: CitizenProfile; recommendation?: string } | null = null;
  let engineUsed: "ollama" | "gemini" | "deterministic" = "deterministic";

  if (engineChoice === "ollama") {
    aiResult = await extractWithOllama(transcript, existingProfile, language);
    if (aiResult) {
      engineUsed = "ollama";
    } else {
      // Fallback to Gemini or Deterministic if Ollama is not running
      aiResult = await extractWithGemini(transcript, existingProfile, language);
      if (aiResult) engineUsed = "gemini";
    }
  } else if (engineChoice === "gemini") {
    aiResult = await extractWithGemini(transcript, existingProfile, language);
    if (aiResult) {
      engineUsed = "gemini";
    } else {
      // Fallback to Ollama or Deterministic
      aiResult = await extractWithOllama(transcript, existingProfile, language);
      if (aiResult) engineUsed = "ollama";
    }
  } else {
    // "auto" mode: Try Ollama first (offline-first!), then Gemini
    aiResult = await extractWithOllama(transcript, existingProfile, language);
    if (aiResult) {
      engineUsed = "ollama";
    } else {
      aiResult = await extractWithGemini(transcript, existingProfile, language);
      if (aiResult) engineUsed = "gemini";
    }
  }

  // Base profile either from AI result or existing
  const baseProfile = aiResult ? aiResult.profile : existingProfile;

  // Always run deterministic extractor on top to guarantee keywords, digits and fallbacks
  const deterministicResult = extractProfileDeterministic(transcript, baseProfile);

  return {
    ...deterministicResult,
    aiRecommendation: aiResult?.recommendation,
    engineUsed,
  };
}
