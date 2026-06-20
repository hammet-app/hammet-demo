import { test, expect } from "@playwright/test";

test("school admin can edit student", async ({ page }) => {

  await page.goto("/admin")

  await page.getByRole('button', { 
    name: 'Close' 
  }).click();

  await page.getByRole('link', { 
    name: 'Students' 
  }).click();

  await page.getByRole('button', { 
    name: 'Resend' 
  }).first().click();

  await page.getByRole('button', { 
    name: 'Revoke' 
  }).first().click();

  await page.getByRole('button', { 
    name: 'Confirm' 
  }).first().click();

  await page.getByRole('button', { 
    name: 'Resend code' 
  }).first().click();

  await page.getByRole('button', { 
    name: 'Delete' 
  }).first().click();



})