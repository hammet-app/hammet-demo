import { z } from "zod";

export const registerSchoolSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "School name must be at least 3 characters."),

  schoolEmail: z
    .email("Enter a valid school email."),

  adminEmail: z
    .email("Enter a valid admin email."),

  adminFullName: z
    .string()
    .trim()
    .min(3, "Enter the administrator's full name."),

  schoolAddress: z
    .string()
    .trim()
    .min(5, "School address is required."),

  schoolWebsite: z.preprocess(
    (value) => value === "" ? undefined : value,
    z.url("Enter a valid website.").optional()
  ),

  phoneNumber: z
    .string()
    .regex(/^\+\d{7,15}$/, "Enter a valid phone number."),

  tier: z.enum([
    "pilot",
    "summer",
    "spark",
    "academy",
    "premier",
    "global",
  ]),

  arms: z.array(z.string()).optional(),

  roles: z.array(z.string()),
});