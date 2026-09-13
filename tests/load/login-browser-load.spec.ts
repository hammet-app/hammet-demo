import { test, expect } from "@playwright/test";
import { login } from "../helpers/auth";

test.describe.configure({ mode: "parallel" });

for (let i = 0; i < 10; i++) {
  test(`concurrent login ${i + 1}`, async ({ page, request }) => {
    const start = performance.now();

    await login(page, request);

    const duration = performance.now() - start;

    console.log(
      `[LOGIN ${i + 1}] ${duration.toFixed(0)}ms`
    );

    await expect(page).toHaveURL(/hammet/);
  });
}