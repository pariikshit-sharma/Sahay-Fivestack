export type SchemeLevel = "central" | "state" | "ut" | "district";

export type BenefitType =
  | "cash_transfer"
  | "subsidy"
  | "insurance"
  | "pension"
  | "scholarship"
  | "in_kind"
  | "loan_guarantee";

export type ApplicationMode = "online" | "offline" | "csc" | "hybrid";

export type VerificationStatus = "unverified" | "in_review" | "verified" | "deprecated";

export type RuleOperator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "in"
  | "not_in"
  | "between"
  | "exists"
  | "not_exists";

export interface EligibilityRule {
  id: string;
  schemeId: string;
  criterionKey: string;
  operator: RuleOperator;
  targetValue: any; // e.g. 18, [18, 59], "female", ["SC", "ST"]
  isMandatory: boolean;
  ruleGroup: number; // Rules in same group are AND-ed; multiple groups are OR-ed
  explanationEn: string;
  explanationHi: string;
  missingPromptEn: string;
  missingPromptHi: string;
}

export interface SchemeDocument {
  id: string;
  schemeId: string;
  documentCode: string;
  nameEn: string;
  nameHi: string;
  descriptionEn?: string;
  descriptionHi?: string;
  isMandatory: boolean;
  issuingAuthority?: string;
  alternativeDocuments?: string[];
}

export interface SchemeSource {
  id: string;
  schemeId: string;
  sourceTitle: string;
  sourceUrl: string;
  sourceType: "official_portal" | "gazette_notification" | "ministry_guideline" | "pib_release";
  publicationDate?: string;
  verified: boolean;
}

export interface Scheme {
  id: string;
  slug: string;
  officialCode?: string;
  titleEn: string;
  titleHi: string;
  summaryEn: string;
  summaryHi: string;
  department: string;
  ministry?: string;
  level: SchemeLevel;
  applicableStates: string[]; // e.g. ['ALL'] or ISO codes like ['IN-HR', 'IN-DL']
  applicableDistricts?: string[];
  benefitType: BenefitType;
  benefitAmountMax?: number; // In INR
  benefitDescriptionEn: string;
  benefitDescriptionHi: string;
  applicationMode: ApplicationMode;
  officialPortalUrl: string;
  verificationStatus: VerificationStatus;
  verifiedAt?: string;
  verifiedBy?: string;
  lastReverifiedAt?: string;
  rules: EligibilityRule[];
  documents: SchemeDocument[];
  sources: SchemeSource[];
}

export type EligibilityStatus =
  | "likely_eligible"
  | "needs_information"
  | "not_eligible"
  | "manual_verification";

export interface EvaluatedCriterion {
  ruleId: string;
  criterionKey: string;
  operator: RuleOperator;
  expectedValue: any;
  actualValue: any;
  passed: boolean;
  isMissing: boolean;
  isMandatory: boolean;
  explanationEn: string;
  explanationHi: string;
}

export interface SchemeEvaluationResult {
  scheme: Scheme;
  status: EligibilityStatus;
  passedCriteria: EvaluatedCriterion[];
  failedCriteria: EvaluatedCriterion[];
  missingCriteria: EvaluatedCriterion[];
  confidence: number; // 0.0 to 1.0
  rationaleSummaryEn: string;
  rationaleSummaryHi: string;
}
