import { test, expect } from "@playwright/test";
import { createPendingUser } from "../helpers/auth";


test("admin can reset password", async ({ page, request }) => {
  const user = await createPendingUser(
    request,
    "school_admin",
    true
  );

  await page.goto(`/reset-password?token=${user.claim_code}`)

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