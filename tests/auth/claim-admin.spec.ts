import { test, expect } from "@playwright/test";
import { createPendingUser } from "../helpers/auth";


test("claim admin account", async ({ page, request }) => {
  const user = await createPendingUser(
    request,
    "school_admin"
  );

  await page.goto("/login");

  await page.goto(`/claim?token=${user.claim_code}`)

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

  await expect(page).toHaveURL(/admin/);

});