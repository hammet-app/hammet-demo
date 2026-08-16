import { faker } from "@faker-js/faker";
import { test, expect } from "@playwright/test";

test("student can login", async ({ page }) => {

  await page.goto("/student/lessons")
 
  await expect(
    page.getByRole('button', { 
      name: 'Close' 
    })
  ).toBeVisible();

  await page.getByRole('button', { 
      name: 'Close' 
  }).click();
  
  await page.getByRole('button', { name: 'Dismiss' }).click();

  await expect(page).toHaveURL(
    /student/
  );

})