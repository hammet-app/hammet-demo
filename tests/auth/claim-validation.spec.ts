import { test, expect } from "@playwright/test";
import { createPendingUser } from "../helpers/auth";


test("claim admin account must be by invite link", async ({ page, request }) => {
  const user = await createPendingUser(
    request,
    "school_admin"
  );

  await page.goto("/login");

  await Promise.all([
    page.waitForURL(/claim/),
    page.getByRole("link", {
      name: /activate your account/i,
    }).click(),
  ]);

  await expect(page).toHaveURL(/claim/);

  page.on("pageerror", (err) => {
    console.log("PAGE ERROR:", err);
  });

  await page.getByRole('textbox', { 
    name: 'Email' 
  }).fill(user.email);

  await page.getByRole('textbox', { 
    name: 'Claim code' 
  }).fill(user.claim_code)

  
  await page.getByRole('button', { 
    name: 'Continue' 
  }).click();

  await expect(
    page.getByText(/This account must be activated via invite link/i)
  ).toBeVisible();

});