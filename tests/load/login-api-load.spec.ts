import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";

test.describe.configure({ mode: "parallel" });

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}


test(`concurrent API login`, async ({ request }) => {
  const email = faker.internet.email().toLowerCase();
  const password = "Password123!";
  const role = "hammet_admin";

  // Create/claim the test user
  const claimStart = performance.now();

  const claimResponse = await request.post(
    `${API_URL}/test/claim_code`,
    {
      params: {
        email,
        role,
      },
    }
  );

  const claimDuration = performance.now() - claimStart;

  expect(claimResponse.ok()).toBeTruthy();

  await Promise.all(
    Array.from({ length: 10 }, async(_, i) => {
      // Login
      const loginStart = performance.now();

      const loginResponse = await request.post(
        `${API_URL}/auth/login`,
        {
          data: {
            email:email,
            password:password,
            device_id: crypto.randomUUID()
          },
        }
      );
      const loginDuration = performance.now() - loginStart;

      console.log(
        `[API LOGIN ${i + 1}] ` +
        `${email} → ` +
        `${loginResponse.status()} → ` +
        `${loginDuration.toFixed(0)}ms ` +
        `(claim: ${claimDuration.toFixed(0)}ms)`
      );

      expect(loginResponse.ok()).toBeTruthy();
    })
  )

  
});
