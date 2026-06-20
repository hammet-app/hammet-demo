import { test } from "@playwright/test";
import { createClaimedUser } from "../helpers/other-roles";

test("create authenticated admin", async ({
  page,
  request,
}) => {

  await createClaimedUser(
    page,
    request,
    "school_admin"
  );

  await page.context().storageState({
  path: "playwright/.auth/admin.json",
  });
})