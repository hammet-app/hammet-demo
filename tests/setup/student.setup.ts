import { test } from "@playwright/test";
import { createClaimedUser } from "../helpers/other-roles";

test("create authenticated student", async ({
  page,
  request,
}) => {
  await createClaimedUser(
    page,
    request,
    "student"
  );

  await page.context().storageState({
    path: "playwright/.auth/student.json",
  });
});