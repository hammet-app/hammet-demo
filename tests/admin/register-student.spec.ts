import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";

test("school admin can create student", async ({ page }) => {

    await page.goto("/admin")

    await page.goto("/admin/students/new");

    await page.getByRole("textbox", {
      name: 'First Name', exact: true
    }).fill(faker.person.firstName());

    await page.getByRole("textbox", {
      name: 'Last Name', exact: true
    }).fill(faker.person.lastName());

    
    await expect(
      page.getByRole('button', { 
        name: 'Close' 
      })
    ).toBeVisible({ timeout: 15000 });

    await page.getByRole('button', { 
        name: 'Close' 
    }).click()

    await page.getByRole('combobox', { name: 'Gender' }).click();

    await page.getByRole('option', { name: 'Male', exact: true }).click();

    await page.getByRole('combobox', { name: 'Class' }).click();
    await page.getByText('SSS1').click();

    await page.locator('input[type="date"]').fill("2026-06-03");

    await page.getByRole("button", {
      name: 'Register student', exact: true
    }).click();

    await expect(
        page.getByText("Name: ")
    )
})