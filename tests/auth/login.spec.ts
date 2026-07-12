import { test, expect } from "@playwright/test";
import { login } from "../helpers/auth";

test("user can login successfully", async ({ page, request }) => {
  await login(page, request);

  await expect(page).toHaveURL(/hammet/);
});