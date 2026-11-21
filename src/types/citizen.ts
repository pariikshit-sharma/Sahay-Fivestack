import { z } from "zod";

export const CitizenProfileSchema = z.object({
  age: z.number().int().min(0).max(120).nullable().default(null),
  gender: z.enum(["female", "male", "other"]).nullable().default(null),
  state: z.string().nullable().default(null),
  district: z.string().nullable().default(null),
  areaType: z.enum(["rural", "urban"]).nullable().default(null),
  occupation: z
    .enum([
      "farmer",
      "daily_wage_worker",
      "street_vendor",
      "student",
      "unemployed",
      "self_employed",
      "salaried",
      "homemaker",
      "other",
    ])
    .nullable()
    .default(null),
  annualHouseholdIncome: z.number().min(0).nullable().default(null),
  landholdingAcres: z.number().min(0).nullable().default(null),
  socialCategory: z.enum(["general", "obc", "sc", "st"]).nullable().default(null),
  isPregnantOrLactating: z.boolean().nullable().default(null),
  hasDisability: z.boolean().nullable().default(null),
  disabilityPercentage: z.number().min(0).max(100).nullable().default(null),
  maritalStatus: z.enum(["single", "married", "widowed", "divorced"]).nullable().default(null),
  bplCardHolder: z.boolean().nullable().default(null),
});

export type CitizenProfile = z.infer<typeof CitizenProfileSchema>;

export const DefaultCitizenProfile: CitizenProfile = {
  age: null,
  gender: null,
  state: null,
  district: null,
  areaType: null,
  occupation: null,
  annualHouseholdIncome: null,
  landholdingAcres: null,
  socialCategory: null,
  isPregnantOrLactating: null,
  hasDisability: null,
  disabilityPercentage: null,
  maritalStatus: null,
  bplCardHolder: null,
};
