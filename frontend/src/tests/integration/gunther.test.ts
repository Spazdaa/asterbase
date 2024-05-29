import { expect, test } from "./fixtures";

test.describe("Gunther AI", () => {
  test("displays chat interface", async ({ page, context }) => {
    // These tests skip authentication and focus on the database functionality.
    await context.addCookies([
      {
        name: "authenticated",
        value: "true",
        url: "http://localhost:3000",
      },
    ]);

    // Go to the Gunther AI page.
    await page.goto("/gunther");
    await expect(
      page.locator("div").filter({ hasText: /^Gunther AI$/ })
    ).toBeVisible();

    // Check for starting message.
    await expect(page.getByText("This is a study tool")).toBeVisible();
    // Check number of remaining sessions is displayed correctly.
    await expect(page.getByText("You have 15 study sessions")).toBeVisible();

    // Enter a message.

    await page
      .getByPlaceholder("Message")
      .fill("Painting consists of applying paint to a surface");
    await page.getByRole("button", { name: "Send" }).click();

    await expect(page.getByText("You have 14 study sessions")).toBeVisible();
  });
});
