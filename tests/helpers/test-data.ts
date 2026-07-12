import { faker } from "@faker-js/faker";

type SchoolTier = "pilot" | "annual";

export interface SchoolData {
  name: string;
  schoolEmail: string;
  adminFullName: string;
  adminEmail: string;
  phoneNumber: string;
  schoolAddress: string;
  schoolWebsite: string;
  roles: string[];
  tier: SchoolTier;
}

export const generateSchoolData = (
  tier: SchoolTier = "pilot"
): SchoolData => ({
  name: `PW-${faker.company.name()}-${Date.now()}`,
  schoolEmail: faker.internet.email(),
  adminFullName: faker.person.fullName(),
  adminEmail: faker.internet.email(),
  phoneNumber: "8123456789",
  schoolAddress: faker.location.streetAddress(),
  schoolWebsite: "https://hammetlabs.com",
  roles: ["hammet_admin"],
  tier,
});