import { test, expect } from "@playwright/test";

test("school admin can update term", async ({ page }) => {

  await page.goto("/admin")

  await page.getByRole('button', { 
    name: 'Close' 
  }).click();


  await page.getByRole('button', { 
    name: 'Manage term'
  }).click();
  await page.getByRole('textbox')
  .first().fill('2026-06-01');

  await page.getByRole('textbox')
  .nth(1).fill('2026-07-08');

  await page.getByRole('combobox')
  .selectOption('2025-2026');

  await page.getByRole('button', { 
    name: 'Save changes' 
  }).click();

})