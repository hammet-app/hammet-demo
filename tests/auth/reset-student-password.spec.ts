import { test, expect } from "@playwright/test";
import { createPendingUser } from "../helpers/auth";


test("student can reset password", async ({ page, request }) => {
  const user = await createPendingUser(
    request,
    "student",
    true
  );

  await page.goto("/login");

  await page.getByRole('link', { 
    name: 'Reset Your Password' 
  }).click();

  await expect(page).toHaveURL("/reset-password")

  await page.getByRole('textbox', { 
    name: 'Email address' 
  }).fill(user.email);

  await page.getByRole('button', {
    name: 'Verify' 
  }).click()

  await page.getByRole('textbox', { 
    name: 'OTP' 
  }).fill(user.claim_code);

  await page.getByRole('button', { 
    name: 'Verify' 
  }).click();

  await expect(page.getByRole('heading', {
    name: 'New password'
  })).toBeVisible();

  await page.getByRole('textbox', { 
    name: 'New password' 
  }).fill("Password1234!");

  await page.getByRole('textbox', { 
    name: 'Confirm password' 
  }).fill("Password1234!");

  await page.getByRole('button', { 
    name: 'Reset password' 
  }).click();

  await expect(page).toHaveURL(
    /\login/
  );

})