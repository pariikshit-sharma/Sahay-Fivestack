import { describe, it, expect } from "vitest";
import { extractProfileDeterministic } from "@/core/profile/extractor";
import { DefaultCitizenProfile } from "@/types/citizen";

describe("Deterministic Profile Extractor", () => {
  it("extracts state, occupation, land, and income from natural Hindi speech", () => {
    const transcript =
      "मैं हरियाणा से हूँ, खेती करता हूँ, 2 एकड़ जमीन है और सालाना 80 हज़ार कमाता हूँ।";

    const result = extractProfileDeterministic(transcript, DefaultCitizenProfile);

    expect(result.profile.state).toBe("IN-HR");
    expect(result.profile.occupation).toBe("farmer");
    expect(result.profile.landholdingAcres).toBe(2);
    expect(result.profile.annualHouseholdIncome).toBe(80000);
    expect(result.extractedFields).toContain("state");
    expect(result.extractedFields).toContain("occupation");
    expect(result.extractedFields).toContain("landholdingAcres");
    expect(result.extractedFields).toContain("annualHouseholdIncome");
  });

  it("extracts pregnant female, age, and state from Hindi text", () => {
    const transcript =
      "मैं उत्तर प्रदेश से महिला हूँ, मेरी उम्र 24 साल है और मैं गर्भवती हूँ।";

    const result = extractProfileDeterministic(transcript, DefaultCitizenProfile);

    expect(result.profile.state).toBe("IN-UP");
    expect(result.profile.gender).toBe("female");
    expect(result.profile.isPregnantOrLactating).toBe(true);
    expect(result.profile.age).toBe(24);
  });

  it("extracts daily wage worker and income in Lakh from English speech", () => {
    const transcript =
      "I live in Delhi, work as a daily wage worker and earn 1.5 lakh per year.";

    const result = extractProfileDeterministic(transcript, DefaultCitizenProfile);

    expect(result.profile.state).toBe("IN-DL");
    expect(result.profile.occupation).toBe("daily_wage_worker");
    expect(result.profile.annualHouseholdIncome).toBe(150000);
  });

  it("identifies missing landholding for a farmer and generates follow-up", () => {
    const transcript = "मैं हरियाणा का किसान हूँ और सालाना 1 लाख कमाता हूँ।";

    const result = extractProfileDeterministic(transcript, DefaultCitizenProfile);

    expect(result.profile.occupation).toBe("farmer");
    expect(result.missingCriticalFields).toContain("landholdingAcres");
    expect(result.suggestedFollowUp?.field).toBe("landholdingAcres");
  });
});
