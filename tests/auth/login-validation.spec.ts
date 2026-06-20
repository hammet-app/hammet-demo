import { test, expect } from "@playwright/test";

test("shows error for invalid credentials", async ({ page }) => {
  await page.goto("/login");

  await page.getByRole('textbox',{name: "Email address"})
    .fill("wrong@example.com");

  await page.getByRole("textbox", {name: "Password"})
    .fill("password");

  await page.getByRole("button", {
    name: "Sign in",
  }).click();

  await expect(
    page.getByText(/User Not Found/i)
  ).toBeVisible();
});


test("email is required", async ({ page }) => {
  await page.goto("/login");

  await page.getByRole("textbox", {name: "Password"})
    .fill("1234567890");

  await page.getByRole("button", {
    name: "Sign in",
  }).click();

  await page.waitForTimeout(6000);

  await expect(
    page.getByText(/Email is required/i)
  ).toBeVisible();
});


test("password is required", async ({ page }) => {
  await page.goto("/login");

  await page.getByRole('textbox',{name: "Email address"})
    .fill("test@example.com");

  await page.getByRole("button", {
    name: "Sign in",
  }).click();

  await page.waitForTimeout(6000);

  await expect(
    page.getByText(/Password is required/i)
  ).toBeVisible();
});

test("invalid email format", async ({ page }) => {
  await page.goto("/login");

  await page.getByRole('textbox',{name: "Email address"})
    .fill("invalid-email");

  await page.getByRole("textbox", {name: "Password"})
    .fill("password");

  await page.getByRole("button", {
    name: "Sign in",
  }).click();

  await page.waitForTimeout(6000);

  await expect(
    page.getByText(/Enter a valid email address/i)
  ).toBeVisible();
});