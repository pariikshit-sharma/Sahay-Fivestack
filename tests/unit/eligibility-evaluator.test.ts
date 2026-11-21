import { describe, it, expect } from "vitest";
import { evaluateScheme } from "@/core/eligibility/evaluator";
import {
  PM_KISAN_SCHEME,
  PM_JAY_SCHEME,
  PMMVY_SCHEME,
} from "@/core/schemes/verified-seeds";
import { CitizenProfile, DefaultCitizenProfile } from "@/types/citizen";
import { Scheme } from "@/types/scheme";

describe("Deterministic Eligibility Engine", () => {
  describe("PM-KISAN Evaluation", () => {
    it("returns likely_eligible for a farmer possessing land", () => {
      const profile: CitizenProfile = {
        ...DefaultCitizenProfile,
        occupation: "farmer",
        landholdingAcres: 2.5,
      };

      const result = evaluateScheme(profile, PM_KISAN_SCHEME);
      expect(result.status).toBe("likely_eligible");
      expect(result.passedCriteria.length).toBe(2);
      expect(result.failedCriteria.length).toBe(0);
      expect(result.missingCriteria.length).toBe(0);
    });

    it("returns needs_information when landholding is missing (null)", () => {
      const profile: CitizenProfile = {
        ...DefaultCitizenProfile,
        occupation: "farmer",
        landholdingAcres: null,
      };

      const result = evaluateScheme(profile, PM_KISAN_SCHEME);
      expect(result.status).toBe("needs_information");
      expect(result.missingCriteria.some((m) => m.criterionKey === "landholdingAcres")).toBe(true);
    });

    it("returns not_eligible when citizen is not a farmer", () => {
      const profile: CitizenProfile = {
        ...DefaultCitizenProfile,
        occupation: "daily_wage_worker",
        landholdingAcres: 0,
      };

      const result = evaluateScheme(profile, PM_KISAN_SCHEME);
      expect(result.status).toBe("not_eligible");
      expect(result.failedCriteria.some((f) => f.criterionKey === "occupation")).toBe(true);
    });
  });

  describe("PM-JAY Evaluation", () => {
    it("returns likely_eligible when household income is below threshold", () => {
      const profile: CitizenProfile = {
        ...DefaultCitizenProfile,
        annualHouseholdIncome: 120000,
      };

      const result = evaluateScheme(profile, PM_JAY_SCHEME);
      expect(result.status).toBe("likely_eligible");
      expect(result.passedCriteria.length).toBe(1);
    });

    it("returns not_eligible when income exceeds maximum threshold", () => {
      const profile: CitizenProfile = {
        ...DefaultCitizenProfile,
        annualHouseholdIncome: 600000,
      };

      const result = evaluateScheme(profile, PM_JAY_SCHEME);
      expect(result.status).toBe("not_eligible");
      expect(result.failedCriteria.length).toBe(1);
    });

    it("returns needs_information when income is unknown", () => {
      const profile: CitizenProfile = {
        ...DefaultCitizenProfile,
        annualHouseholdIncome: null,
      };

      const result = evaluateScheme(profile, PM_JAY_SCHEME);
      expect(result.status).toBe("needs_information");
      expect(result.missingCriteria.length).toBe(1);
    });
  });

  describe("PMMVY Evaluation", () => {
    it("returns likely_eligible for an eligible pregnant adult female", () => {
      const profile: CitizenProfile = {
        ...DefaultCitizenProfile,
        gender: "female",
        isPregnantOrLactating: true,
        age: 24,
      };

      const result = evaluateScheme(profile, PMMVY_SCHEME);
      expect(result.status).toBe("likely_eligible");
      expect(result.passedCriteria.length).toBe(3);
    });

    it("returns not_eligible if applicant is male", () => {
      const profile: CitizenProfile = {
        ...DefaultCitizenProfile,
        gender: "male",
        isPregnantOrLactating: false,
        age: 30,
      };

      const result = evaluateScheme(profile, PMMVY_SCHEME);
      expect(result.status).toBe("not_eligible");
      expect(result.failedCriteria.some((f) => f.criterionKey === "gender")).toBe(true);
    });

    it("returns not_eligible if mother is under 19", () => {
      const profile: CitizenProfile = {
        ...DefaultCitizenProfile,
        gender: "female",
        isPregnantOrLactating: true,
        age: 17,
      };

      const result = evaluateScheme(profile, PMMVY_SCHEME);
      expect(result.status).toBe("not_eligible");
      expect(result.failedCriteria.some((f) => f.criterionKey === "age")).toBe(true);
    });
  });

  describe("Geographic Scope & Verification Checks", () => {
    const STATE_SPECIFIC_SCHEME: Scheme = {
      ...PM_KISAN_SCHEME,
      id: "state-test-01",
      applicableStates: ["IN-UP"],
    };

    it("rejects when citizen state does not match state-specific scheme", () => {
      const profile: CitizenProfile = {
        ...DefaultCitizenProfile,
        state: "IN-HR", // Haryana citizen applying for UP-only scheme
        occupation: "farmer",
        landholdingAcres: 2,
      };

      const result = evaluateScheme(profile, STATE_SPECIFIC_SCHEME);
      expect(result.status).toBe("not_eligible");
      expect(result.failedCriteria.some((f) => f.criterionKey === "state")).toBe(true);
    });

    it("returns manual_verification when scheme is unverified or in_review", () => {
      const unverifiedScheme: Scheme = {
        ...PM_KISAN_SCHEME,
        verificationStatus: "in_review",
      };

      const profile: CitizenProfile = {
        ...DefaultCitizenProfile,
        occupation: "farmer",
        landholdingAcres: 2,
      };

      const result = evaluateScheme(profile, unverifiedScheme);
      expect(result.status).toBe("manual_verification");
    });
  });
});
