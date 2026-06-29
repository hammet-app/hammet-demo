import { test, expect } from "@playwright/test";

test("unauthenticated users are redirected to login", async ({
  page,
}) => {
  await page.goto("/hammet");

  await expect(page).toHaveURL(/login/);
});