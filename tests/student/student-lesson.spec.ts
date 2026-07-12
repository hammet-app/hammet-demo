import { faker } from "@faker-js/faker";
import { test, expect } from "@playwright/test";

test("student can login", async ({ page }) => {

  await page.goto("/student/lessons")

  await expect(page).toHaveURL(
    /student/
  );

})