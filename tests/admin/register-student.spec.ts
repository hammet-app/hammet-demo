import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";

test("school admin can create student", async ({ page }) => {

    await page.goto("/admin")

    await page.getByRole('button', { 
        name: 'Close' 
    }).click();

    await page.goto("/admin/students/new")

    await page.getByRole("textbox", {
      name: 'Full name', exact: true
    }).fill(faker.person.fullName());

    await page.getByRole("textbox", {
      name: 'Email', exact: true
    }).fill(faker.internet.email().toLowerCase());

    await page.getByRole("combobox").first().selectOption("JSS2");

    await page.getByRole("textbox", {
      name: 'Parent email', exact: true
    }).fill(faker.internet.email().toLowerCase());

    await page.getByRole("textbox", {
      name: 'Phone number', exact: true
    }).fill("8123456789");

    await page.locator('input[type="date"]').fill("2026-06-03");

    await page.getByRole("button", {
      name: 'Register student', exact: true
    }).click();

    await expect(
        page.getByText("Name: ")
    )
})