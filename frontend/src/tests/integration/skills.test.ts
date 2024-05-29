import api from "api";

import { expect, test } from "./fixtures";

test.describe("Skills", () => {
  test("displays skills", async ({ page, context }) => {
    test.slow();

    // These tests skip authentication and focus on the database functionality.
    await context.addCookies([
      {
        name: "authenticated",
        value: "true",
        url: "http://localhost:3000",
      },
    ]);

    // Add a skill to the database.
    await api.post("/skills", { name: "Skill 1" });

    // Go to the My Skills page.
    await page.goto("/skills");
    await expect(
      page.locator("div").filter({ hasText: /^My Skills$/ })
    ).toBeVisible();

    // Add a new skill.
    await page.getByRole("combobox").click();
    await page.getByText("Skill 1").click();
    await expect(page.getByText("Skill added!")).toBeVisible();
    await expect(page.getByText("Skill 1")).toBeVisible();

    // Delete the skill.
    await page.getByText("Skill 1").hover();
    await page.getByTestId("skill-dropdown-button").click();
    await page.getByTestId("delete-skill").click();
    await expect(page.getByText("Skill deleted!")).toBeVisible();
    await expect(page.getByText("Skill 1")).not.toBeVisible();
  });
});
