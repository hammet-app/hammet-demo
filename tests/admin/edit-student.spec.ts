import { test, expect } from "@playwright/test";

test("school admin can edit student", async ({ page }) => {

  await page.goto("/admin")

  await page.pause();

  await page.getByRole('button', { 
    name: 'Close' 
  }).click();

  await page.getByRole('button', { name: 'Dismiss' }).click();

  await page.getByRole('link', { 
    name: 'Students' 
  }).click();

  await page.pause()

})