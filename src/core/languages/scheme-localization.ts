import { Scheme, SchemeDocument, EligibilityRule } from "@/types/scheme";

export function getSchemeTitle(scheme: Scheme, lang: string): string {
  if (scheme.titles && scheme.titles[lang]) return scheme.titles[lang];
  if (lang === "en") return scheme.titleEn;
  return scheme.titleHi || scheme.titleEn;
}

export function getSchemeSummary(scheme: Scheme, lang: string): string {
  if (scheme.summaries && scheme.summaries[lang]) return scheme.summaries[lang];
  if (lang === "en") return scheme.summaryEn;
  return scheme.summaryHi || scheme.summaryEn;
}

export function getSchemeDepartment(scheme: Scheme, lang: string): string {
  if (scheme.departments && scheme.departments[lang]) return scheme.departments[lang];
  if (lang === "en") return scheme.department;
  return scheme.departments?.["hi"] || scheme.department;
}

export function getSchemeBenefitDescription(scheme: Scheme, lang: string): string {
  if (scheme.benefitDescriptions && scheme.benefitDescriptions[lang]) return scheme.benefitDescriptions[lang];
  if (lang === "en") return scheme.benefitDescriptionEn;
  return scheme.benefitDescriptionHi || scheme.benefitDescriptionEn;
}

export function getDocumentName(doc: SchemeDocument, lang: string): string {
  if (doc.translations && doc.translations[lang]) return doc.translations[lang];
  if (lang === "en") return doc.nameEn;
  return doc.nameHi || doc.nameEn;
}

export function getRuleExplanation(rule: EligibilityRule, lang: string): string {
  if (rule.translations && rule.translations[lang]) return rule.translations[lang];
  if (lang === "en") return rule.explanationEn;
  return rule.explanationHi || rule.explanationEn;
}
