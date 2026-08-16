import { faker } from "@faker-js/faker";
import { test, expect } from "@playwright/test";

test("school admin can update student", async ({ page }) => {

  await page.goto("/admin")

  await page.pause();

  await expect(
    page.getByRole('button', { 
      name: 'Close' 
    })
  ).toBeVisible();

  await page.getByRole('button', { 
      name: 'Close' 
  }).click()

  await page.getByRole('button', { name: 'Dismiss' }).click();

  await page.getByRole('link', { 
    name: 'Students' 
  }).click({timeout: 15000});

  await expect(page).toHaveURL(
    /\/admin\/students/
  );

  await page.pause();

  await page.locator('.flex.items-center.justify-center.rounded-lg').first().click();

  await page.getByRole('button', { 
    name: 'Update' 
  }).first().click();

  await expect(page).toHaveURL(
    /\/admin\/students\/.*\/edit$/
  );

  await page.getByRole('textbox', { 
    name: 'Student email' 
  }).fill(faker.internet.email());

  await page.locator('input[type="date"]').fill('2024-06-18');

  await page.getByRole('combobox').selectOption('SSS1');

  
  await page.getByRole('button', { 
    name: 'Update student' 
  }).click();

  await expect(page).toHaveURL(
    /\/admin\/students/
  );

})