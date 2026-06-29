import { test } from "@playwright/test";
import { login } from "../helpers/auth";

test("create authenticated hammet", async ({
  page, request
}) => {
  await login(
    page, request
  );

  await page.context().storageState({
    path: "playwright/.auth/hammet.json",
  });
});