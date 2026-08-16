import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";

const rows = Array.from({ length: 10 }, () => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return [
    `${firstName} ${lastName}`,
    faker.helpers.arrayElement([
      "JSS1",
      "JSS2",
      "JSS3",
      "SSS1",
      "SSS2",
      "SSS3",
    ]),
    faker.helpers.arrayElement(["A", "B", "C"]),
    faker.date.birthdate({
      min: 10,
      max: 16,
      mode: "age",
    }).toISOString().split("T")[0],
    faker.helpers.arrayElement(["M", "F"])
  ].join(",");
}).join("\n");

test("school admin can bulk create students", async ({ page }) => {

  await page.goto("/admin")

  await expect(
    page.getByRole('button', { 
      name: 'Close' 
    })
  ).toBeVisible();

  await page.getByRole('button', { 
      name: 'Close' 
  }).click();

  await page.getByRole('button', { name: 'Dismiss' }).click();

  await page.getByRole('button', { 
    name: 'Bulk import students'
  }).click();

  await page.getByRole('button', { name: 'Paste CSV' }).click();

  await page.getByRole('textbox', { 
    name: 'Chisom Obi,SSS1,A,2011-01-09,'
  }).fill(rows);

  

  const importButton = page.getByRole("button", {
    name: /Import \d+ Students?/,
  });

  await expect(importButton).toBeEnabled({ timeout: 15_000 });

  await importButton.click();

  

  await page.getByText("10 students registered")

})