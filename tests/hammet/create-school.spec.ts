import { test, expect } from "@playwright/test";
import { generateSchoolData } from "../helpers/test-data";
import { login } from "../helpers/auth";

test("hammet admin can register a school", async ({ page, request }) => {
  const school = (generateSchoolData());

  await login(page, request);

  await page.goto("/hammet/schools/new");
  
  await expect(page).toHaveURL(/schools\/new/);

  await page.getByRole('button', { 
    name: 'Close' 
  }).click();

  
  page.on("pageerror", (err) => {
    console.log("PAGE ERROR:", err);
  });

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

  await page.getByRole("textbox", {
    name: "Phone number",
  }).fill(school.phoneNumber);

  await page.getByRole("textbox", {
    name: "Full name",
  }).fill(school.adminFullName);

  await page.getByRole("textbox", {
    name: "Email",
    exact: true,
  }).fill(school.adminEmail);

  await page.getByRole('button', { 
    name: school.tier.toUpperCase()
    }).click();

  await page.getByRole("button", {
    name: "Register school",
  }).click();

  await expect(
    page.getByRole("button", {
        name: "Back to schools",
    })
    ).toBeVisible()

});