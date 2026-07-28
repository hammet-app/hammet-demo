import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";

test("school admin can create student", async ({ page }) => {

    await page.goto("/admin")

    await page.getByRole('button', { 
        name: 'Close' 
    }).click();
    
    await page.getByRole('button', { name: 'Dismiss' }).click();

    await page.goto("/admin/students/new");

    await page.pause();

    await page.getByRole("textbox", {
      name: 'Full name', exact: true
    }).fill(faker.person.fullName());

    await page.getByRole("textbox", {
      name: 'Email', exact: true
    }).fill(faker.internet.email().toLowerCase());

    await page.pause();

    await page.getByRole('combobox', { name: 'Gender' }).click();

    await page.pause();

    await page.getByRole('option', { name: 'Male', exact: true }).click();

    await page.pause();

    await page.getByRole('combobox', { name: 'Class' }).click();
    await page.getByText('JSS2').click();

    await page.pause();

    await page.locator('input[type="date"]').fill("2026-06-03");

    await page.pause();

    await page.getByRole("button", {
      name: 'Register student', exact: true
    }).click();

    await expect(
        page.getByText("Name: ")
    )
})