import { describe, it, expect } from "vitest";
import { VERIFIED_NATIONAL_SCHEMES } from "@/core/schemes/verified-seeds";
import { evaluateScheme } from "@/core/eligibility/evaluator";
import { CitizenProfile, DefaultCitizenProfile } from "@/types/citizen";

describe("Scheme Matching & Checklist API Service", () => {
  it("correctly matches and prioritizes schemes for a small farmer profile", () => {
    const farmerProfile: CitizenProfile = {
      ...DefaultCitizenProfile,
      gender: "male",
      state: "IN-HR",
      occupation: "farmer",
      landholdingAcres: 1.5,
      annualHouseholdIncome: 95000,
    };

    const matches = VERIFIED_NATIONAL_SCHEMES.map((scheme) =>
      evaluateScheme(farmerProfile, scheme)
    );

    // Expect PM-KISAN to be likely_eligible
    const pmKisanMatch = matches.find((m) => m.scheme.officialCode === "PM-KISAN");
    expect(pmKisanMatch).toBeDefined();
    expect(pmKisanMatch?.status).toBe("likely_eligible");

    // Expect PM-JAY to be likely_eligible (income <= 2.5L)
    const pmJayMatch = matches.find((m) => m.scheme.officialCode === "PM-JAY");
    expect(pmJayMatch).toBeDefined();
    expect(pmJayMatch?.status).toBe("likely_eligible");

    // Expect PMMVY to be not_eligible for male applicant
    const pmmvyMatch = matches.find((m) => m.scheme.officialCode === "PMMVY");
    expect(pmmvyMatch).toBeDefined();
    expect(pmmvyMatch?.status).toBe("not_eligible");

    // When gender is null/unspecified, PMMVY must return needs_information (never assume ineligibility without data)
    const unspecifiedGenderFarmer: CitizenProfile = {
      ...farmerProfile,
      gender: null,
    };
    const unspecifiedMatches = evaluateScheme(unspecifiedGenderFarmer, VERIFIED_NATIONAL_SCHEMES[2]);
    expect(unspecifiedMatches.status).toBe("needs_information");
  });

  it("verifies required documents and official source URLs exist for all seeded schemes", () => {
    for (const scheme of VERIFIED_NATIONAL_SCHEMES) {
      expect(scheme.documents.length).toBeGreaterThan(0);
      expect(scheme.sources.length).toBeGreaterThan(0);
      expect(scheme.officialPortalUrl).toMatch(/^https:\/\/.*(\.gov\.in|\.nic\.in)/);
      expect(scheme.verificationStatus).toBe("verified");
    }
  });
});
