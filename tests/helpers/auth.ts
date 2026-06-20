import { Page, expect, APIRequestContext } from "@playwright/test";
import { faker } from "@faker-js/faker";


export async function login(page: Page, request: APIRequestContext) {

  const email = faker.internet.email().toLowerCase()
  const password = "Password123!"
  const role = "hammet_admin"

  const response = await request.post(
    `${process.env.NEXT_PUBLIC_API_URL}/test/claim_code`,
    {
      params: { email, role },
    }
  );

  console.log(response.status());
  console.log(await response.text());

  await page.goto("/login");

  await page.getByLabel("Email address")
    .fill(email);

  await page.getByLabel("Password")
    .fill(password);

  await page.getByRole("button", {
    name: "Sign in",
  }).click();

  await page.waitForTimeout(3000);
  
  await expect(page).toHaveURL(
    /hammet/
  );
}

export async function logout(page: Page) {
  await page.getByRole("button", {
    name: "Close",
  }).click();

  await page.getByRole("button", {
    name: "Sign Out",
  }).click();

  await page.waitForTimeout(3000);
}

export async function createPendingUser(
  request: APIRequestContext,
  role: string
) {
  const email = faker.internet.email()
  const response = await request.post(
    `${process.env.NEXT_PUBLIC_API_URL}/test/claim_code`,
    {
      params: { email, role },
    }
  );

  return await response.json();
}