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
 * Universal Profile Extraction entry point.
 * Uses free Google Gemini API if GEMINI_API_KEY is configured;
 * otherwise automatically uses the 100% Free Deterministic Extractor.
 */
export async function extractCitizenProfile(
  transcript: string,
  existingProfile: CitizenProfile = DefaultCitizenProfile
): Promise<ExtractionResult> {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    // Free local fallback
    return extractProfileDeterministic(transcript, existingProfile);
  }

  try {
    const prompt = `You are the profile extractor for SAHAY, an Indian public welfare discovery platform.
Extract the citizen's parameters from their speech transcript into the requested JSON format.
Only extract facts explicitly stated. Do NOT invent or assume values.

Citizen transcript: "${transcript}"
Current profile: ${JSON.stringify(existingProfile)}

Return strictly JSON matching this structure:
{
  "age": number or null,
  "gender": "female" | "male" | "other" | null,
  "state": "IN-HR" | "IN-UP" | "IN-DL" | "IN-BR" | "IN-MP" | null,
  "occupation": "farmer" | "daily_wage_worker" | "street_vendor" | "student" | "unemployed" | "self_employed" | "salaried" | "homemaker" | "other" | null,
  "annualHouseholdIncome": number (in INR) or null,
  "landholdingAcres": number (in acres) or null,
  "isPregnantOrLactating": boolean or null
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      }
    );

    if (!response.ok) {
      return extractProfileDeterministic(transcript, existingProfile);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) {
      return extractProfileDeterministic(transcript, existingProfile);
    }

    const parsed = JSON.parse(content);
    const merged: CitizenProfile = {
      ...existingProfile,
      ...(parsed.age !== undefined && parsed.age !== null ? { age: parsed.age } : {}),
      ...(parsed.gender ? { gender: parsed.gender } : {}),
      ...(parsed.state ? { state: parsed.state } : {}),
      ...(parsed.occupation ? { occupation: parsed.occupation } : {}),
      ...(parsed.annualHouseholdIncome !== undefined && parsed.annualHouseholdIncome !== null
        ? { annualHouseholdIncome: parsed.annualHouseholdIncome }
        : {}),
      ...(parsed.landholdingAcres !== undefined && parsed.landholdingAcres !== null
        ? { landholdingAcres: parsed.landholdingAcres }
        : {}),
      ...(parsed.isPregnantOrLactating !== undefined && parsed.isPregnantOrLactating !== null
        ? { isPregnantOrLactating: parsed.isPregnantOrLactating }
        : {}),
    };

    // Calculate extracted fields
    const extractedFields: string[] = [];
    for (const [k, v] of Object.entries(parsed)) {
      if (v !== null && v !== undefined) extractedFields.push(k);
    }

    return extractProfileDeterministic(transcript, merged);
  } catch {
    return extractProfileDeterministic(transcript, existingProfile);
  }
}
