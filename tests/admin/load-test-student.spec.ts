/*import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import fs from "node:fs";
import path from "node:path";

const TARGET_USERS = Number(process.env.LOAD_TEST_USERS) || 10;

console.log("TARGET_USERS:", TARGET_USERS);

const USERS_FILE = path.resolve(process.cwd(), "../load_test_users.json");

type RegisterStudentResponse = {
  fullName: string;
  username: string;
  password: string;
};

type BulkRegisterResponse = { 
  passwords: RegisterStudentResponse[];
  total: number; 
};

function loadExistingUsers(): RegisterStudentResponse[] {
  if (!fs.existsSync(USERS_FILE)) {
    return [];
  }

  return JSON.parse(
    fs.readFileSync(USERS_FILE, "utf-8")
  );
}

function saveUsers(users: RegisterStudentResponse[]) {
  fs.writeFileSync(
    USERS_FILE,
    JSON.stringify(users, null, 2),
    "utf-8"
  );
}

test("school admin provision load test students", async ({ page }) => {
  const existingUsers = loadExistingUsers();

  const needed = TARGET_USERS - existingUsers.length;

  console.log(
    `Load-test users: ${existingUsers.length}/${TARGET_USERS}`
  );

  if (needed <= 0) {
    console.log("Enough load-test users already exist.");
    return;
  }

  console.log(`Creating ${needed} additional students...`);

  const rows = Array.from({ length: needed }, () => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    return [
      `${firstName} ${lastName}`,
      faker.helpers.arrayElement([
        "SSS1",
      ]),
      faker.helpers.arrayElement(["A", "B", "C"]),
      faker.date.birthdate({
        min: 10,
        max: 16,
        mode: "age",
      }).toISOString().split("T")[0],
      faker.helpers.arrayElement(["M", "F"]),
    ].join(",");
  }).join("\n");

  await page.goto("/admin");

  await expect(
    page.getByRole("button", {
      name: "Close",
    })
  ).toBeVisible();

  await page.getByRole("button", {
    name: "Close",
  }).click();

  await page.getByRole("button", {
    name: "Bulk import students",
  }).click();

  await page.getByRole("button", {
    name: "Paste CSV",
  }).click();

  await page.getByRole("textbox", {
    name: "Chisom Obi,SSS1,A,2011-01-09,",
  }).fill(rows);

  const importButton = page.getByRole("button", {
    name: new RegExp(`Import ${needed} Students?`),
  });

  await expect(importButton).toBeEnabled({
    timeout: 15_000,
  });

  /*
   * We need the backend response here so we can capture
   * username/password for the newly created students.
   
  const responsePromise = page.waitForResponse(
    response =>
      response.url().includes("/auth/register/students/bulk") &&
      response.request().method() === "POST" &&
      response.ok()
  );

  await importButton.click();

  const response = await responsePromise;

  const result = (await response.json()) as BulkRegisterResponse;

  const createdUsers = result.passwords;

  expect(result.total).toBe(needed)

  expect(createdUsers).toHaveLength(needed);

  const allUsers = [
    ...existingUsers,
    ...createdUsers,
  ];

  saveUsers(allUsers);

  await page.getByText(
    `${needed} students registered`
  );

  console.log(
    `Load-test users ready: ${allUsers.length}`
  );
});*/
