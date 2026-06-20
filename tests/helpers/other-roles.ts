import { Page, APIRequestContext, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";

type UserRole = "school_admin" | "student";

interface ClaimedUser {
  email: string;
  password: string;
  claimCode: string;
  role: UserRole;
}

export async function createClaimedUser(
  page: Page,
  request: APIRequestContext,
  role: UserRole
): Promise<ClaimedUser> {
  const email = faker.internet.email().toLowerCase();
  const password = "Password123!";

  // Create pending user through test endpoint
  const response = await request.post(
    `${process.env.NEXT_PUBLIC_API_URL}/test/claim_code`,
    {
      params: { email, role },
    }
  );

  expect(response.ok()).toBeTruthy();

  const { claim_code } = await response.json();

  if (role === "school_admin") {
    // School admins receive token in query params
    await page.goto(`/claim?token=${claim_code}`);
  } else {
    // Students submit token through the form
    await page.goto("/claim");

    await page.getByRole('textbox', { 
      name: 'Email' 
    }).fill(email);

    await page.getByRole('textbox', { 
      name: 'Claim code' 
    }).fill(claim_code);

    await page.getByRole('button', { 
      name: 'Continue' 
    }).click();
  }

  // Email should be displayed on claim page
  await expect(
    page.getByText(email, {exact: false})
  ).toBeVisible();

  await page.getByRole('textbox', { 
    name: 'Create password' 
  }).fill(password);

  await page.getByRole('textbox', { 
    name: 'Confirm password' 
  }).fill(password);

  await page.getByRole('button', { 
    name: 'Activate account' 
  }).click();

  // Wait for authenticated state
  await expect(page).toHaveURL(/student|admin/);

  return {
    email,
    password,
    claimCode: claim_code,
    role,
  };
}