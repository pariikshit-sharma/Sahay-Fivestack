# SAHAY — Phase 0: Master Architecture Specification & Repository Audit
*Product: SAHAY — Your benefits. Your language. Your access.*
*Classification: Public-Benefit Technology Platform*

---

## 1. Current Repository Assessment

### 1.1 Workspace State
- **Workspace Location**: `d:\ist hackathon`
- **Initial State**: Clean, brand-new directory initialized on 21 November 2026.
- **Git Status**: Not yet initialized. A clean Git repository will be created upon approval.
- **Legacy Artifacts**: None. There are no legacy codebases, broken configs, or outdated dependencies to compromise the architecture.

### 1.2 Runtime Environment & Tooling
- **Node.js**: `v24.16.0` (LTS)
- **Package Manager**: `pnpm` (v11.18.0) and `npm` (v11.13.0).
  *Note on Windows Environment*: Execution of `.ps1` files is restricted by Windows PowerShell policies. Commands are invoked through `pnpm.cmd` / `npm.cmd`. Per sandbox rules, all package installation commands (`pnpm add`, `pnpm install`) run with elevated bypass sandbox permission.
- **Database Infrastructure**: Supabase PostgreSQL 17 is active, connected, and healthy via MCP (`wgruwuslaoczyusxhoey`, `ap-northeast-2`).
- **Version Control**: Git 2.54.0 (Windows).

---

## 2. Core Architecture Philosophy & System Boundaries

SAHAY is built on a **Non-Negotiable Rule**:
> **The Large Language Model (LLM) must NEVER independently determine or compute eligibility.**
> Eligibility computation is 100% deterministic, testable, verifiable, and grounded in official government gazette rules.

```
+-----------------------------------------------------------------------------------+
|                                 CITIZEN INTERFACE                                 |
|                                                                                   |
|    +------------------------------------+   +--------------------------------+    |
|    |      SIMPLE MODE (Default)         |   |         DETAILED MODE          |    |
|    |  - Voice-First Single Question     |   |  - Multi-Facet Geographic Filter   |
|    |  - Large Tap Targets (min 48px)    |   |  - Granular Criteria Breakdown |    |
|    |  - Conversational Native Script    |   |  - Scheme Comparison Matrix    |    |
|    |  - One-Tap Read Aloud              |   |  - Official Circular Links     |    |
|    +------------------------------------+   +--------------------------------+    |
|                     ^                                       ^                     |
|                     +-------------------+-------------------+                     |
|                                         |                                         |
+-----------------------------------------|-----------------------------------------+
                                          v
+-----------------------------------------------------------------------------------+
|                        SPEECH & MULTILINGUAL SUBSYSTEM                            |
|                                                                                   |
|  - Pluggable STT / TTS Adapters (Web Speech API / Cloud fallback)                 |
|  - Indian Language Registry (22 Official Languages + Dialects)                   |
|  - Native Script Renderers (Devanagari, Tamil, Bengali, etc.)                     |
|  - Graceful Audio Degradation (Microphone block detection -> Instant Touch UI)    |
+-----------------------------------------------------------------------------------+
                                          |
                      +-------------------+-------------------+
                      |                                       |
                      v                                       v
+---------------------------------------+   +---------------------------------------+
|        AI REASONING LAYER             |   |     DETERMINISTIC ELIGIBILITY         |
|         (Vercel AI SDK)               |   |            ENGINE (AST)               |
|                                       |   |                                       |
|  1. Natural Language Extraction:      |   |  1. AST Criteria Evaluation:          |
|     Converts citizen transcripts into |   |     Runs pure numeric, categorical,   |
|     typed `CitizenProfile` (Zod).     |   |     and geographic comparators.       |
|                                       |   |                                       |
|  2. Follow-Up Formulation:            |   |  2. Strict 4-State Output:            |
|     Generates natural follow-ups for  |   |     - likely_eligible                 |
|     missing critical fields only.     |   |     - needs_information               |
|                                       |   |     - not_eligible                    |
|  3. Grounded Explanation:             |   |     - manual_verification             |
|     Translates verified evaluation    |   |                                       |
|     traces into simple phrasing.      |   |  3. Audit Trace:                      |
|                                       |   |     Records every passed/failed rule. |
+---------------------------------------+   +---------------------------------------+
                      |                                       |
                      +-------------------+-------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                    DATA & VERIFICATION CORE (Supabase PG17)                       |
|                                                                                   |
|  - Verified Schemes Catalog (Central + 28 States + 8 UTs)                         |
|  - AST Eligibility Rules Table with strict constraints                            |
|  - Official Document Matrix & Gazette Provenance Links                            |
|  - Verification Audit Log & Re-verification Timestamps                            |
+-----------------------------------------------------------------------------------+
```

---

## 3. Recommended Folder Structure

```
d:\ist hackathon\
├── .env.example
├── .gitignore
├── README.md
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── next.config.ts
├── docs\
│   └── architecture\
│       └── PHASE_0_SPEC.md
├── supabase\
│   ├── migrations\
│   │   └── 20261121000000_init_sahay_core.sql
│   └── seed.sql
├── tests\
│   ├── unit\
│   │   ├── eligibility-evaluator.test.ts
│   │   └── profile-extractor.test.ts
│   └── e2e\
│       └── citizen-journey.spec.ts
└── src\
    ├── app\
    │   ├── layout.tsx
    │   ├── globals.css
    │   ├── page.tsx                           # Landing & Mode Router
    │   ├── simple\
    │   │   └── page.tsx                       # Simple Mode Voice Card Onboarding
    │   ├── detailed\
    │   │   ├── page.tsx                       # Advanced Search & Filter Grid
    │   │   └── [id]\
    │   │       └── page.tsx                   # Full Scheme Deep Dive & Checklist
    │   ├── admin\
    │   │   └── verify\page.tsx                # Verification Queue & Provenance Audit
    │   └── api\
    │       └── v1\
    │           ├── chat\route.ts
    │           ├── profile\extract\route.ts
    │           ├── schemes\route.ts
    │           ├── schemes\[id]\route.ts
    │           ├── schemes\[id]\checklist\route.ts
    │           ├── schemes\match\route.ts
    │           ├── coverage\route.ts
    │           └── languages\route.ts
    ├── components\
    │   ├── ui\                                # Accessible UI Primitives
    │   │   ├── Button.tsx
    │   │   ├── Card.tsx
    │   │   ├── Modal.tsx
    │   │   ├── Badge.tsx
    │   │   ├── Slider.tsx
    │   │   └── Tooltip.tsx
    │   ├── voice\                             # Voice & Audio Engine
    │   │   ├── VoiceButton.tsx
    │   │   ├── ReadAloudButton.tsx
    │   │   ├── WaveformVisualizer.tsx
    │   │   └── VoiceStatusIndicator.tsx
    │   ├── simple-mode\                       # Low-Literacy Experience
    │   │   ├── ConversationalCard.tsx
    │   │   ├── VisualRangeSelector.tsx
    │   │   ├── AudioPromptPlayer.tsx
    │   │   └── ProfileConfirmationSheet.tsx
    │   ├── detailed-mode\                     # Advanced Explorer Experience
    │   │   ├── SchemeFilterBar.tsx
    │   │   ├── SchemeCard.tsx
    │   │   ├── EligibilityRuleMatrix.tsx
    │   │   └── SchemeComparisonDrawer.tsx
    │   └── shared\
    │       ├── LanguageSelector.tsx
    │       ├── ModeSwitch.tsx
    │       ├── Navbar.tsx
    │       ├── Footer.tsx
    │       ├── TrustBadge.tsx
    │       └── SourceProvenanceModal.tsx
    ├── core\
    │   ├── eligibility\                       # DETERMINISTIC ENGINE
    │   │   ├── types.ts                       # AST Rule Definitions & Results
    │   │   ├── evaluator.ts                   # Pure functional evaluator
    │   │   ├── comparators.ts                 # Numeric, categorical, geo checks
    │   │   └── explainer.ts                   # Trace to human readable rationale
    │   ├── profile\
    │   │   ├── schema.ts                      # Zod schema for CitizenProfile
    │   │   └── parser.ts                      # Profile normalization & sanitization
    │   ├── languages\
    │   │   ├── registry.ts                    # 22 Scheduled Languages + Fallbacks
    │   │   ├── types.ts
    │   │   └── dictionaries\                  # UI Strings (hi.json, en.json, etc.)
    │   └── speech\
    │       ├── types.ts                       # STT / TTS provider interfaces
    │       ├── web-speech.ts                  # Native browser speech engine
    │       └── speech-service.ts              # Capability detector & fallback manager
    ├── lib\
    │   ├── ai\
    │   │   ├── client.ts                      # Vercel AI SDK Provider abstraction
    │   │   └── prompts.ts                     # Strict extraction & explanation prompts
    │   ├── db\
    │   │   ├── client.ts                      # Supabase client (Client & Server)
    │   │   └── queries.ts                     # Optimized DB operations
    │   └── utils\
    │       ├── currency.ts                    # Indian currency formatting (Lakhs/Crores)
    │       └── formatters.ts
    └── types\
        ├── scheme.ts
        ├── citizen.ts
        └── api.ts
```

---

## 4. Database Entity-Relationship Design (PostgreSQL 17 / Supabase)

### 4.1 Schema Definition
1. `schemes`: Stores verified central, state, UT, and district welfare schemes with geographic bounding, categorisation, and application links.
2. `eligibility_rules`: Structured AST criteria (numeric range, categorical set, boolean conditions, geographic presence). Rules are evaluated in deterministic groupings.
3. `scheme_documents`: Matrix of mandatory vs. optional documents required for application, along with issuing authorities.
4. `scheme_sources`: Gazette notifications, ministry guidelines, and government portal URLs guaranteeing data provenance.
5. `scheme_versions`: Complete JSON snapshot history for auditability whenever eligibility criteria or benefits change.

### 4.2 Postgres Security & Optimization
- **Row-Level Security (RLS)**: Enforced across all tables. Public anonymous clients can only read verified records. Writes are restricted to admin identities.
- **Indexes**: GIN indexing on `applicable_states`, partial B-tree on `verification_status = 'verified'`, and compound indexing on `(department, level)`.

---

## 5. Standardized API Contracts

All API endpoints are validated using **Zod** schemas for both requests and responses.

- `POST /api/v1/profile/extract`: Converts conversational speech transcript into a validated `CitizenProfile` with identified missing fields.
- `POST /api/v1/schemes/match`: Pure deterministic matching returning four-state status (`likely_eligible`, `needs_information`, `not_eligible`, `manual_verification`) with passed/failed criteria traces.
- `GET /api/v1/schemes`: Paginated list of verified schemes with multi-facet filters.
- `GET /api/v1/schemes/:id`: Complete scheme details including verified sources and criteria breakdown.
- `GET /api/v1/schemes/:id/checklist`: Document preparation checklist with offline/online application guidance.
- `GET /api/v1/coverage`: Real-time transparency dashboard showing verified scheme count across 28 states, 8 UTs, and departments.
- `GET /api/v1/languages`: Language registry metadata indicating speech-to-text and voice availability.

---

## 6. Phase-by-Phase Roadmap

1. **Phase 0**: Repository Audit, Architecture Specification & Quality Gates (Current).
2. **Phase 1**: Foundation & Design System (Next.js 15, Tailwind, Accessible Tokens, Language & Mode Switchers).
3. **Phase 2**: Citizen Onboarding & Voice Experience (Web Speech STT/TTS adapter, conversational single-question cards, visual fallback).
4. **Phase 3**: Database & Scheme Management (Supabase migrations, verified seed schemes: PM-KISAN, PM-JAY, PMMVY).
5. **Phase 4**: Deterministic Eligibility Engine (Pure AST rule evaluator, boundary condition unit tests).
6. **Phase 5**: AI Grounded Conversation & Extraction (Vercel AI SDK integration, zero-hallucination prompts).
7. **Phase 6**: Results, Document Checklists & Advanced Comparison (Personalized result cards, read-aloud, official links).
8. **Phase 7**: National Scale & Multilingual Expansion (28 States & 8 UTs metadata, coverage dashboard).
9. **Phase 8**: Security, Accessibility & Production Verification (WCAG 2.1 AA audit, OWASP scan, end-to-end testing).

---

## 7. Quality Gates & Acceptance Criteria

1. **Zero Hallucinated Scheme Data**: 100% of seeded schemes backed by official `.gov.in` / `.nic.in` sources.
2. **Deterministic Integrity**: Eligibility engine unit test suite with 100% pass rate on edge cases (null income, boundary ages, missing state).
3. **Accessibility**: Minimum 48px touch targets, full keyboard accessibility, screen reader ARIA support, contrast ratio $\ge 4.5:1$.
4. **Bilingual Parity**: 100% parity across Hindi and English for all UI, questions, and eligibility explanations from Day 1.
5. **Security**: Zero exposed secrets, all queries guarded by Supabase RLS.
