import { test, expect } from "@playwright/test";
import { generateSchoolData } from "../helpers/test-data";
import { login } from "../helpers/auth";

function randomItem(array: string[]) {
  return array[Math.floor(Math.random() * array.length)];
}

const tier = randomItem([
  "pilot",
  "summer",
  "spark",
  "academy",
  "premier",
  "global",
]);

test("hammet admin can register a school", async ({ page, request }) => {
  const school = (generateSchoolData());

  await login(page, request);

  await page.goto("/hammet/schools/new");
  
  await expect(page).toHaveURL(/schools\/new/);

  await expect(
    page.getByRole('button', { 
      name: 'Close' 
    })
  ).toBeVisible();

  await page.getByRole('button', { 
      name: 'Close' 
  }).click()

  await page.getByRole('button', { name: 'Dismiss' }).click();

  await page.getByRole("textbox", {
    name: "School name",
  }).fill(school.name);

  await page.getByRole("textbox", {
    name: "School email",
  }).fill(school.schoolEmail);

  await page.getByRole("textbox", {
    name: "Address",
  }).fill(school.schoolAddress);

  await page.getByRole("textbox", {
    name: "Website (optional)",
  }).fill(school.schoolWebsite);

  await page.getByPlaceholder('+').fill("+234")

  await page.getByPlaceholder('Phone number').fill(school.phoneNumber);

  await page.getByRole("textbox", {
    name: "Full name",
  }).fill(school.adminFullName);

  await page.getByRole("textbox", {
    name: "Email",
    exact: true,
  }).fill(school.adminEmail);

  await page.getByRole('combobox', { name: 'Tier' }).click();
  await page.getByRole('option', { name: 'Summer' }).click();

  await page.getByRole("button", {
    name: "Register school",
  }).click();

  await expect(
    page.getByRole("button", {
      name: "Registering…",
    })
  ).not.toBeVisible({
    timeout: 15000,
  });

  await expect(
    page.getByRole("button", {
        name: "Back to schools",
    })
    ).toBeVisible()

});