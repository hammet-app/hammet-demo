import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";

const rows = Array.from({ length: 10 }, () => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return [
    `${firstName} ${lastName}`,
    faker.internet.email({
      firstName,
      lastName,
    }).toLowerCase(),
    faker.helpers.arrayElement([
      "JSS1",
      "JSS2",
      "JSS3",
      "SSS1",
      "SSS2",
      "SSS3",
    ]),
    faker.helpers.arrayElement(["A", "B", "C"]),
    faker.internet.email().toLowerCase(),
    `+2349090234444`,
    faker.date.birthdate({
      min: 10,
      max: 16,
      mode: "age",
    }).toISOString().split("T")[0],
  ].join(",");
}).join("\n");

test("school admin can bulk create students", async ({ page }) => {

  await page.goto("/admin")

  await page.getByRole('button', { 
    name: 'Close' 
  }).click();

  await page.getByRole('button', { name: 'Dismiss' }).click();

  await page.getByRole('button', { 
    name: 'Bulk import students'
  }).click();

  await page.pause();

  await page.getByRole('button', { name: 'Paste CSV' }).click();

  await page.getByRole('textbox', { 
    name: 'Chisom Obi,chisom@school.edu.' 
  }).fill(rows);

  await page.getByRole('button', { 
    name: 'Import 10 students' 
  }).click()

  await page.getByText("10 students registered")

})