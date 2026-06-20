import { test, expect } from "@playwright/test";
import { createPendingUser } from "../helpers/auth";


test("claim student account", async ({ page, request }) => {
  const user = await createPendingUser(
    request,
    "student"
  );

  await page.goto("/login");

  await page.goto(`/claim`)
  
  await page.getByRole('textbox', { 
    name: 'Email' 
  }).fill(user.email);

  await page.getByRole('textbox', { 
    name: 'Claim code' 
  }).fill(user.claim_code);

  await page.getByRole('button', { 
    name: 'Continue' 
  }).click();

  await expect(
    page.getByText(user.email, { exact: false })
  ).toBeVisible();

  await page.getByRole('textbox', { 
    name: 'Create password' 
  }).fill("Qwertyuiop[1");

  await page.getByRole('textbox', { 
    name: 'Confirm password' 
  }).fill("Qwertyuiop[1");


  await page.getByRole('button', { 
    name: 'Activate account' 
  }).click();

  await page.waitForTimeout(6000);

  await expect(page).toHaveURL(/student/);

});