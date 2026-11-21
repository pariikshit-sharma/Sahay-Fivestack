# SAHAY — सहाय
> **Your benefits. Your language. Your access.**  
> *आपकी योजनाएं। आपकी भाषा। आपकी पहुँच।*

A production-minded, scalable, accessible, voice-first, multilingual Indian government welfare scheme discovery platform.

---

## 🏛️ Product Vision

SAHAY is built as a serious public-benefit technology product to help citizens across India discover welfare schemes that apply to their specific circumstances.

Instead of navigating complex government bureaucracy or deciphering technical terminology, citizens can explain their situation in their own language—preferably through **voice**—and receive clear, grounded guidance on:
- Which government schemes they may qualify for.
- **Why** they qualify (traceable criteria matching).
- What information is still missing.
- Complete document checklists and issuing authorities.
- Direct links to official government application portals (`.gov.in`).

> **Core Principle**: Make government benefits easier to discover without compromising the accuracy of official information. **The AI never guesses eligibility.** All eligibility evaluation is 100% deterministic, backed by structured AST rules grounded in official Gazette circulars.

---

## ✨ Key Capabilities

### 1. Two Purpose-Built Experience Modes
- **Simple Mode (Default — `/simple`)**:
  - Voice-first single-question cards.
  - Large, high-contrast touch targets ($\ge 48\text{px}$).
  - Everyday conversational phrasing (e.g. *"आपके घर में सभी लोग मिलाकर लगभग कितना पैसा कमाते हैं?"* instead of bureaucratic income bracket jargon).
  - Native speech recognition with visual chip fallbacks.
  - One-tap audio read-aloud for instructions and scheme eligibility rationales.
- **Detailed Mode (`/detailed`)**:
  - Multi-facet filters across Geography (States/UTs), Ministries/Departments, and Benefit Types.
  - Searchable catalog of verified schemes.
  - Granular criteria breakdown matrix and document requirements.
  - Direct links to official circulars and application portals.

### 2. 100% Free API & Client-Side Architecture
- **Speech-to-Text (STT)**: Powered by the browser native **Web Speech API** (`webkitSpeechRecognition`). Completely free, client-side, zero latency, with graceful fallbacks.
- **Text-to-Speech (TTS)**: Powered by native **Web Speech Synthesis** (`window.speechSynthesis`), tuned for natural Indian accents (`hi-IN`, `en-IN`).
- **Profile Extractor**: Supports Google Gemini API free tier, with an automatic, zero-dependency **deterministic Indian NLP fallback** that parses Hindi and English speech offline.
- **Database**: Supabase PostgreSQL 17 with strict Row-Level Security (RLS) policies.

### 3. Deterministic Eligibility Engine (AST-Based)
The LLM does **not** decide whether a citizen qualifies. The engine evaluates pure TypeScript AST rules against citizen profiles, emitting 4 strict statuses:
1. `likely_eligible`: All mandatory criteria verified and satisfied.
2. `needs_information`: Criteria could not be evaluated due to missing citizen attributes; triggers a single, polite follow-up.
3. `not_eligible`: Mandatory criterion definitively failed (e.g., location or income threshold mismatch).
4. `manual_verification`: Scheme is undergoing re-verification or official guidelines require in-person assessment.

### 4. Multilingual India-First Foundation
- Built for all **22 Eighth Schedule Indian Languages**: Hindi, English, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, Assamese, Urdu, Sanskrit, Kashmiri, Konkani, Manipuri, Nepali, Bodo, Dogri, Maithili, and Santali.
- Native script rendering (Devanagari, Tamil, Bengali, etc.).
- Transparent support tiers: only claims `fully_supported` when the entire journey has been validated.

### 5. Ground-Truth Verified Schemes Seeded
- **PM-KISAN** (*Pradhan Mantri Kisan Samman Nidhi*): ₹6,000/yr direct income support for landholding farmers.
- **Ayushman Bharat PM-JAY**: ₹5,00,000/yr cashless healthcare coverage for vulnerable families.
- **PMMVY** (*Pradhan Mantri Matru Vandana Yojana*): ₹5,000 maternity cash benefit for pregnant and lactating mothers.

---

## 🏗️ Technical Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons.
- **State & Context**: Custom React Context with persistent mode and language switching.
- **Validation**: Zod schema validation across all DTOs and citizen profile extractions.
- **Testing**: Vitest for deterministic unit and integration tests (17/17 passing).
- **Database**: Supabase PostgreSQL 17 with Row-Level Security (RLS) and GIN indexes.

---

## 📁 Repository Structure

```
.
├── src/
│   ├── app/
│   │   ├── (modes)/
│   │   │   ├── page.tsx               # Landing & Mode Switcher
│   │   │   ├── simple/page.tsx        # Simple Mode Voice Card Onboarding
│   │   │   ├── detailed/page.tsx      # Detailed Mode Filter Matrix
│   │   │   ├── detailed/[id]/page.tsx # Scheme Deep Dive & Checklist
│   │   │   └── coverage/page.tsx      # National Coverage Dashboard
│   │   ├── api/v1/
│   │   │   ├── profile/extract/       # Natural language profile extraction
│   │   │   ├── schemes/match/         # Deterministic scheme matching
│   │   │   ├── schemes/               # Verified schemes catalog API
│   │   │   ├── coverage/              # National coverage stats API
│   │   │   └── languages/             # Supported languages API
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                        # Button, Card, Badge, Modal primitives
│   │   ├── voice/                     # VoiceInputButton, ReadAloudButton
│   │   └── shared/                    # Navbar, Footer, LanguageSelector, ModeSwitch
│   ├── core/
│   │   ├── eligibility/               # Pure AST evaluator & comparators
│   │   ├── profile/                   # Free Gemini + Deterministic NLP extractor
│   │   ├── languages/                 # 22 Indian languages registry & dictionaries
│   │   ├── speech/                    # Web Speech STT/TTS adapters
│   │   └── schemes/                   # Verified ground-truth scheme seeds
│   └── types/                         # Scheme, CitizenProfile, API DTO types
├── supabase/
│   ├── migrations/                    # PostgreSQL 17 RLS & schema definitions
│   └── seed.sql                       # 100% verified seed schemes
├── tests/
│   └── unit/                          # 17 Unit tests for eligibility & extraction
├── docs/
│   └── architecture/                  # Phase 0 Master Architecture Spec
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v20+` or `v24+`
- `pnpm` (recommended) or `npm`

### Installation
```bash
# Clone the repository
git clone https://github.com/pariikshit-sharma/Sahay-Fivestack.git
cd Sahay-Fivestack

# Install dependencies
pnpm install
```

### Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### Development
```bash
# Run local development server
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Run Tests
```bash
# Run all unit and integration tests with Vitest
pnpm test
```

### Production Build
```bash
pnpm build
```

---

## 🔒 Public Welfare Safety Notice

**SAHAY will NEVER ask for Aadhaar numbers, bank account passwords, or OTPs.**  
This platform is strictly an informational and discovery service. All official applications must be submitted directly through the verified `.gov.in` government portals linked on the platform.

---

## 📄 License
MIT License. Built for Indian Citizen Welfare.
