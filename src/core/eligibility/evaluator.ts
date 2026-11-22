import {
  Scheme,
  EligibilityRule,
  EvaluatedCriterion,
  SchemeEvaluationResult,
  EligibilityStatus,
} from "@/types/scheme";
import { CitizenProfile } from "@/types/citizen";
import { evaluateComparator } from "./comparators";

/**
 * Normalizes different alias keys used across scheme rules into standard CitizenProfile keys
 */
export function getProfileValue(profile: CitizenProfile, criterionKey: string): any {
  if (!profile) return null;

  switch (criterionKey) {
    case "annual_income":
    case "annualHouseholdIncome":
    case "income":
      return profile.annualHouseholdIncome;

    case "land_ownership":
    case "landholding":
      if (profile.landholdingAcres !== null) {
        return profile.landholdingAcres > 0;
      }
      return null;

    case "landholdingAcres":
    case "land_size":
    case "landSize":
      return profile.landholdingAcres;

    case "pregnant":
    case "is_pregnant":
    case "pregnancy":
    case "isPregnantOrLactating":
      return profile.isPregnantOrLactating;

    case "state":
    case "stateCode":
      return profile.state;

    case "age":
      return profile.age;

    case "gender":
      return profile.gender;

    case "occupation":
      return profile.occupation;

    case "socialCategory":
    case "caste":
      return profile.socialCategory;

    case "hasDisability":
    case "disability":
      return profile.hasDisability;

    case "bplCardHolder":
    case "bpl":
      return profile.bplCardHolder;

    default:
      return (profile as any)[criterionKey] ?? null;
  }
}

/**
 * Checks state/regional match with loose mapping (e.g. "IN-MP", "MP", "Madhya Pradesh")
 */
function isStateApplicable(applicableStates: string[], userState: string | null): boolean {
  if (!applicableStates || applicableStates.length === 0 || applicableStates.includes("ALL")) {
    return true;
  }
  if (!userState) return false;

  const normalizedUser = userState.toLowerCase().replace("in-", "").trim();

  return applicableStates.some((s) => {
    const normSchemeState = s.toLowerCase().replace("in-", "").trim();
    return (
      normSchemeState === normalizedUser ||
      normSchemeState.includes(normalizedUser) ||
      normalizedUser.includes(normSchemeState)
    );
  });
}

/**
 * Pure, deterministic eligibility engine for SAHAY
 * Evaluates a citizen profile against verified scheme AST rules with intelligent alias resolution.
 */
export function evaluateScheme(
  profile: CitizenProfile,
  scheme: Scheme
): SchemeEvaluationResult {
  if (scheme.verificationStatus !== "verified") {
    return {
      scheme,
      status: "manual_verification",
      passedCriteria: [],
      failedCriteria: [],
      missingCriteria: [],
      confidence: 0.5,
      rationaleSummaryEn:
        "This scheme requires manual verification by an official as official guidelines are undergoing re-verification.",
      rationaleSummaryHi:
        "इस योजना के नियमों का पुनर्सत्यापन जारी है, अतः अंतिम पुष्टि के लिए विभागीय सत्यापन आवश्यक है।",
    };
  }

  // 1. Geographic applicability check
  const isPanIndia =
    scheme.applicableStates.includes("ALL") || scheme.applicableStates.length === 0;
  const stateMatches = isPanIndia || isStateApplicable(scheme.applicableStates, profile.state);

  const allPassed: EvaluatedCriterion[] = [];
  const allFailed: EvaluatedCriterion[] = [];
  const allMissing: EvaluatedCriterion[] = [];

  // If geographic check fails definitively
  if (!isPanIndia && profile.state && !stateMatches) {
    const geoFail: EvaluatedCriterion = {
      ruleId: "geo-state-mismatch",
      criterionKey: "state",
      operator: "in",
      expectedValue: scheme.applicableStates,
      actualValue: profile.state,
      passed: false,
      isMissing: false,
      isMandatory: true,
      explanationEn: `This scheme is only available in selected states (${scheme.applicableStates.join(", ")}).`,
      explanationHi: `यह योजना केवल चयनित राज्यों में ही लागू है (${scheme.applicableStates.join(", ")})।`,
    };
    allFailed.push(geoFail);

    return {
      scheme,
      status: "not_eligible",
      passedCriteria: [],
      failedCriteria: [geoFail],
      missingCriteria: [],
      confidence: 1.0,
      rationaleSummaryEn: `Not eligible due to state location requirement.`,
      rationaleSummaryHi: `स्थान/राज्य की शर्त पूरी न होने के कारण यह योजना आपके क्षेत्र में लागू नहीं है।`,
    };
  }

  // If state is required but citizen profile doesn't have it
  if (!isPanIndia && !profile.state) {
    allMissing.push({
      ruleId: "geo-state-missing",
      criterionKey: "state",
      operator: "in",
      expectedValue: scheme.applicableStates,
      actualValue: null,
      passed: false,
      isMissing: true,
      isMandatory: true,
      explanationEn: "State residence information is required.",
      explanationHi: "आपके निवास का राज्य जानना आवश्यक है।",
    });
  }

  // 2. Group rules by ruleGroup (default group 1)
  const groupedRules: Record<number, EligibilityRule[]> = {};
  for (const rule of scheme.rules) {
    const g = rule.ruleGroup || 1;
    if (!groupedRules[g]) groupedRules[g] = [];
    groupedRules[g].push(rule);
  }

  // 3. Evaluate each rule group
  const groupResults: Array<{
    group: number;
    passed: EvaluatedCriterion[];
    failed: EvaluatedCriterion[];
    missing: EvaluatedCriterion[];
    isEligible: boolean;
  }> = [];

  for (const [groupStr, rules] of Object.entries(groupedRules)) {
    const groupNum = Number(groupStr);
    const passed: EvaluatedCriterion[] = [];
    const failed: EvaluatedCriterion[] = [];
    const missing: EvaluatedCriterion[] = [];

    for (const rule of rules) {
      // Resolve using smart alias resolver
      const actualValue = getProfileValue(profile, rule.criterionKey);
      const result = evaluateComparator(rule.operator, rule.targetValue, actualValue);

      const criterion: EvaluatedCriterion = {
        ruleId: rule.id,
        criterionKey: rule.criterionKey,
        operator: rule.operator,
        expectedValue: rule.targetValue,
        actualValue: actualValue,
        passed: result.passed,
        isMissing: result.isMissing,
        isMandatory: rule.isMandatory,
        explanationEn: rule.explanationEn,
        explanationHi: rule.explanationHi,
      };

      if (result.isMissing) {
        missing.push(criterion);
      } else if (result.passed) {
        passed.push(criterion);
      } else {
        failed.push(criterion);
      }
    }

    const hasMandatoryFail = failed.some((f) => f.isMandatory);
    const hasMandatoryMissing = missing.some((m) => m.isMandatory);
    const isEligible = !hasMandatoryFail && !hasMandatoryMissing;

    groupResults.push({
      group: groupNum,
      passed,
      failed,
      missing,
      isEligible,
    });
  }

  // Aggregate criteria across all groups
  for (const gr of groupResults) {
    allPassed.push(...gr.passed);
    allFailed.push(...gr.failed);
    allMissing.push(...gr.missing);
  }

  // 4. Determine final status
  let finalStatus: EligibilityStatus;
  const anyGroupEligible = groupResults.some((g) => g.isEligible);

  if (anyGroupEligible && (!allMissing.some((m) => m.isMandatory) || isPanIndia || profile.state)) {
    finalStatus = "likely_eligible";
  } else {
    const allGroupsHaveMandatoryFail = groupResults.every((g) =>
      g.failed.some((f) => f.isMandatory)
    );

    if (allGroupsHaveMandatoryFail) {
      finalStatus = "not_eligible";
    } else if (allMissing.length > 0) {
      finalStatus = "needs_information";
    } else {
      finalStatus = "not_eligible";
    }
  }

  // 5. Formulate human-readable rationale
  let rationaleSummaryEn = "";
  let rationaleSummaryHi = "";

  if (finalStatus === "likely_eligible") {
    const passedCount = allPassed.length;
    rationaleSummaryEn = `You meet all ${passedCount} verified mandatory criteria for this scheme.`;
    rationaleSummaryHi = `आप इस योजना की सभी ${passedCount} आवश्यक शर्तों को पूरा करते हैं।`;
  } else if (finalStatus === "needs_information") {
    const missingKeys = Array.from(new Set(allMissing.map((m) => m.criterionKey))).join(", ");
    rationaleSummaryEn = `To confirm eligibility, additional details are needed: ${missingKeys}.`;
    rationaleSummaryHi = `पात्रता की पक्की पुष्टि के लिए कुछ अतिरिक्त जानकारी चाहिए: ${missingKeys}।`;
  } else {
    const failedMandatory = allFailed.filter((f) => f.isMandatory);
    const failReason = failedMandatory.map((f) => f.explanationEn).join("; ");
    const failReasonHi = failedMandatory.map((f) => f.explanationHi).join("; ");
    rationaleSummaryEn = `You do not currently meet the requirements: ${failReason || "Criteria mismatch"}.`;
    rationaleSummaryHi = `वर्तमान नियमों के अनुसार: ${failReasonHi || "शर्त पूरी नहीं होती"}।`;
  }

  const totalRules = scheme.rules.length + (isPanIndia ? 0 : 1);
  const confidence = totalRules > 0 ? (allPassed.length + allFailed.length) / totalRules : 1.0;

  return {
    scheme,
    status: finalStatus,
    passedCriteria: allPassed,
    failedCriteria: allFailed,
    missingCriteria: allMissing,
    confidence: Math.round(confidence * 100) / 100,
    rationaleSummaryEn,
    rationaleSummaryHi,
  };
}
