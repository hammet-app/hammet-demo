import { test, expect } from "@playwright/test";
import { login, logout } from "../helpers/auth";

test("user can logout successfully", async ({ page, request }) => {
  await login(page, request);

  await logout(page);

  await expect(page).toHaveURL(/login/);
});