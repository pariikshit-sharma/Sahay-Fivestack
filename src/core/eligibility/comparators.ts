import { RuleOperator } from "@/types/scheme";

export interface ComparatorResult {
  passed: boolean;
  isMissing: boolean;
}

/**
 * Pure deterministic comparator evaluator
 */
export function evaluateComparator(
  operator: RuleOperator,
  targetValue: any,
  actualValue: any
): ComparatorResult {
  // If actualValue is missing (null or undefined)
  if (actualValue === null || actualValue === undefined) {
    if (operator === "not_exists") {
      return { passed: true, isMissing: false };
    }
    // Missing condition: cannot pass or fail definitively
    return { passed: false, isMissing: true };
  }

  switch (operator) {
    case "eq":
      return { passed: actualValue === targetValue, isMissing: false };

    case "neq":
      return { passed: actualValue !== targetValue, isMissing: false };

    case "gt":
      return {
        passed: typeof actualValue === "number" && actualValue > targetValue,
        isMissing: false,
      };

    case "gte":
      return {
        passed: typeof actualValue === "number" && actualValue >= targetValue,
        isMissing: false,
      };

    case "lt":
      return {
        passed: typeof actualValue === "number" && actualValue < targetValue,
        isMissing: false,
      };

    case "lte":
      return {
        passed: typeof actualValue === "number" && actualValue <= targetValue,
        isMissing: false,
      };

    case "in":
      if (Array.isArray(targetValue)) {
        return {
          passed: targetValue.includes(actualValue),
          isMissing: false,
        };
      }
      return { passed: false, isMissing: false };

    case "not_in":
      if (Array.isArray(targetValue)) {
        return {
          passed: !targetValue.includes(actualValue),
          isMissing: false,
        };
      }
      return { passed: false, isMissing: false };

    case "between":
      if (Array.isArray(targetValue) && targetValue.length === 2) {
        const [min, max] = targetValue;
        const num = Number(actualValue);
        return {
          passed: !isNaN(num) && num >= min && num <= max,
          isMissing: false,
        };
      }
      return { passed: false, isMissing: false };

    case "exists":
      return {
        passed: actualValue !== null && actualValue !== undefined && actualValue !== "",
        isMissing: false,
      };

    case "not_exists":
      return {
        passed: actualValue === null || actualValue === undefined || actualValue === "",
        isMissing: false,
      };

    default:
      return { passed: false, isMissing: false };
  }
}
