import { faker } from "@faker-js/faker";
import { test, expect } from "@playwright/test";

test("school admin can update student", async ({ page }) => {

  await page.goto("/admin")

  await page.getByRole('button', { 
    name: 'Close' 
  }).click();

  await page.getByRole('link', { 
    name: 'Students' 
  }).click({timeout: 15000});

  await expect(page).toHaveURL(
    /\/admin\/students/
  );

  await page.getByRole('button', { 
    name: 'Update' 
  }).first().click();

  await expect(page).toHaveURL(
    /\/admin\/students\/.*\/edit$/
  );

  await page.getByRole('textbox', { 
    name: 'Enter email' 
  }).fill(faker.internet.email());

  await page.locator('input[type="date"]').fill('2024-06-18');

  await page.getByRole('textbox', { 
    name: 'SSS1, SSS2...' 
  }).fill('JSS3');

  await page.getByRole('textbox', { 
    name: 'Enter Parent Email' 
  }).fill(faker.internet.email());

  
  await page.getByRole('textbox', { 
    name: 'Enter Parent phone' 
  }).fill('09091234567');

  
  await page.getByRole('button', { 
    name: 'Update student' 
  }).click();

  await expect(page).toHaveURL(
    /\/admin\/students/
  );

})