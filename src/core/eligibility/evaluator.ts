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
 * Pure, deterministic eligibility engine for SAHAY
 * Evaluates a citizen profile against verified scheme AST rules.
 */
export function evaluateScheme(
  profile: CitizenProfile,
  scheme: Scheme
): SchemeEvaluationResult {
  // 1. Check if scheme is verified; if not, return manual_verification
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

  // 2. Geographic applicability check
  const isPanIndia =
    scheme.applicableStates.includes("ALL") || scheme.applicableStates.length === 0;
  const stateMatches =
    isPanIndia || (profile.state && scheme.applicableStates.includes(profile.state));

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

  // 3. Group rules by ruleGroup (default group 1)
  const groupedRules: Record<number, EligibilityRule[]> = {};
  for (const rule of scheme.rules) {
    const g = rule.ruleGroup || 1;
    if (!groupedRules[g]) groupedRules[g] = [];
    groupedRules[g].push(rule);
  }

  // 4. Evaluate each rule group
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
      const actualValue = (profile as any)[rule.criterionKey];
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

  // Determine final status
  let finalStatus: EligibilityStatus;

  // Check if any rule group succeeded completely
  const anyGroupEligible = groupResults.some((g) => g.isEligible);

  if (anyGroupEligible && (!allMissing.some((m) => m.isMandatory) || isPanIndia || profile.state)) {
    finalStatus = "likely_eligible";
  } else {
    // If every group has at least one mandatory failure
    const allGroupsHaveMandatoryFail = groupResults.every((g) =>
      g.failed.some((f) => f.isMandatory)
    );

    if (allGroupsHaveMandatoryFail) {
      finalStatus = "not_eligible";
    } else if (allMissing.length > 0) {
      // Missing info exists and could determine eligibility
      finalStatus = "needs_information";
    } else {
      finalStatus = "not_eligible";
    }
  }

  // Formulate human rationale summary
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

  // Confidence computation
  const totalCriteria = allPassed.length + allFailed.length + allMissing.length;
  const confidence =
    totalCriteria > 0 ? Number(((allPassed.length + allFailed.length) / totalCriteria).toFixed(2)) : 1.0;

  return {
    scheme,
    status: finalStatus,
    passedCriteria: allPassed,
    failedCriteria: allFailed,
    missingCriteria: allMissing,
    confidence,
    rationaleSummaryEn,
    rationaleSummaryHi,
  };
}
