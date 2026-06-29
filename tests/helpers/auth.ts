import { Page, expect, APIRequestContext } from "@playwright/test";
import { faker } from "@faker-js/faker";


export async function login(page: Page, request: APIRequestContext) {

  const email = faker.internet.email().toLowerCase()
  const password = "Password123!"
  const role = "hammet_admin"

  await request.post(
    `${process.env.NEXT_PUBLIC_API_URL}/test/claim_code`,
    {
      params: { email, role },
    }
  );

  await page.goto("/login");

  await page.getByRole('textbox',{name: "Email address"})
    .fill(email);

  await page.getByRole("textbox", {name: "Password"})
    .fill(password);

  await page.getByRole("button", {
    name: "Sign in",
  }).click();
  
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
}

export async function createPendingUser(
  request: APIRequestContext,
  role: string,
  reset?: boolean,
) {
  const email = faker.internet.email()

  const params = {
    email,
    role,
    ...(reset !== undefined && { reset }),
  };

  const response = await request.post(
    `${process.env.NEXT_PUBLIC_API_URL}/test/claim_code`,
    { params }
  );

  return await response.json();
}