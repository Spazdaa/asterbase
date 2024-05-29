import api from "api";

import { expect, startServer, stopServer, test } from "./fixtures";

test.describe("Workspace", () => {
  test("displays workspace", async ({ page, context }) => {
    test.slow();

    // These tests skip authentication and focus on the database functionality.
    await context.addCookies([
      {
        name: "authenticated",
        value: "true",
        url: "http://localhost:3000",
      },
    ]);

    // Ensure that user cannot navigate to a workspace that doesn't exist.
    await page.goto("/workspaces/2");
    await expect(
      page.getByText("Page Does Not Exist", { exact: true })
    ).toBeVisible();

    // Create a workspace.
    await api.post("/workspaces", { name: "Workspace 1" });
    const { data: workspaces } = await api.get("/workspaces");
    expect(workspaces.length).toBe(1);
    await page.goto(`/workspaces/${workspaces[0]._id as string}`);
    await expect(page.getByTestId("workspace-title")).toBeVisible();

    // Display error banner when server connection fails.
    await stopServer();
    await page.getByText("+ ADD BLOCK").click();
    await page.getByText("Resources").click();
    await page.goto(`/workspaces/${workspaces[0]._id as string}`);
    await expect(
      page.getByText("Error: Could not connect to server")
    ).toBeVisible({ timeout: 60000 });
    await startServer();
    await page.goto(`/workspaces/${workspaces[0]._id as string}`);
    await expect(
      page.getByText("Error: Could not connect to server")
    ).not.toBeVisible({ timeout: 60000 });

    // Add a resource block.
    await page.getByText("+ ADD BLOCK").click();
    await page.getByText("Resources").click();
    await expect(page.getByText("Block created!")).toBeVisible();
    await expect(page.getByText("Resource Block")).toBeVisible();

    // Drag the resource block.
    await expect(page.getByTestId("draggable")).toHaveCSS("top", "0px");
    await expect(page.getByTestId("draggable")).toHaveCSS("left", "0px");
    await page
      .getByText("Resource Block")
      .dragTo(page.getByTestId("workspace-title"));
    // Center of Workspace title element located at (-x, 352), where -x is above the draggable
    // workspace area. Thus, the top value should not exceed 0px.
    await expect(page.getByTestId("draggable")).toHaveCSS("top", "0px");
    await expect(page.getByTestId("draggable")).toHaveCSS("left", "352px");

    // Add a resource to the block.
    await page.getByText("Resource Block").hover();
    await page.getByTestId("add-resource-button").click();
    await expect(page.getByPlaceholder("Untitled")).toBeVisible();
    await page.getByPlaceholder("Untitled").fill("Resource 1");
    await page
      .locator("#image")
      .setInputFiles("src/tests/integration/testImage.png");
    await page.keyboard.press("Escape");
    await expect(page.getByText("Resource 1", { exact: true })).toBeVisible();
    await expect(page.getByAltText("Resource 1")).toBeVisible();

    // Edit the resource.
    await page.getByText("Resource 1", { exact: true }).click();
    await page.getByTestId("flowbite-card").click();
    await expect(page.getByText("Resource 1", { exact: true })).toBeVisible();
    await page.getByPlaceholder("Untitled").fill("Resource 2");
    await page.keyboard.press("Escape");
    await expect(page.getByText("Resource 2", { exact: true })).toBeVisible();

    // Add another resource.
    await page.getByText("Resource Block").hover();
    await page.getByTestId("add-resource-button").click();
    await expect(page.getByPlaceholder("Untitled")).toBeVisible();
    await page.getByPlaceholder("Untitled").fill("Resource 1");
    await page
      .locator("#image")
      .setInputFiles("src/tests/integration/testImage.png");
    await page.keyboard.press("Escape");
    await expect(page.getByText("Resource 1", { exact: true })).toBeVisible();
    await expect(page.getByAltText("Resource 1")).toBeVisible();

    // Reorder the resources.
    let resource1BoundingBox = await page
      .getByText("Resource 1", { exact: true })
      .boundingBox();
    let resource2BoundingBox = await page
      .getByText("Resource 2", { exact: true })
      .boundingBox();
    if (resource1BoundingBox === null || resource2BoundingBox === null) {
      throw new Error("Resource bounding box is null");
    }
    expect(resource1BoundingBox.y).toBeGreaterThan(resource2BoundingBox.y);
    // page.dragTo does not work for the sortable lists, so drag it manually.
    await page.mouse.move(
      resource1BoundingBox.x + resource1BoundingBox.width / 2,
      resource1BoundingBox.y + resource1BoundingBox.height / 2
    );
    await page.mouse.down();
    await page.mouse.move(
      resource2BoundingBox.x + resource2BoundingBox.width / 2,
      resource2BoundingBox.y + resource2BoundingBox.height / 2,
      { steps: 10 }
    );
    await page.mouse.up();
    // Wait for the reordering animation to finish.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    resource1BoundingBox = await page
      .getByText("Resource 1", { exact: true })
      .boundingBox();
    resource2BoundingBox = await page
      .getByText("Resource 2", { exact: true })
      .boundingBox();
    if (resource1BoundingBox === null || resource2BoundingBox === null) {
      throw new Error("Resource bounding box is null");
    }
    expect(resource1BoundingBox.y).toBeLessThan(resource2BoundingBox.y);

    // Delete the resource.
    await page.getByText("Resource 2", { exact: true }).click();
    await page.getByTestId("edit-resource-dropdown-button").click();
    await page.getByTestId("delete-resource").click();
    await expect(page.getByText("Resource 2")).not.toBeVisible();

    // Delete the resource block.
    await page.getByText("Resource Block").hover();
    await page.getByTestId("resource-dropdown-button").click();
    await page.getByTestId("delete-resource-block").click();
    await page.getByTestId("confirm-deletion").click();
    await expect(page.getByText("Resource block deleted!")).toBeVisible();
    await expect(page.getByText("Resource Block")).not.toBeVisible();

    // Add a project block.
    await page.getByText("+ ADD BLOCK").click();
    await page.getByText("Projects").click();
    // Close the dropdown. Flowbite doesn't do this anymore for some reason.
    await page.getByText("+ ADD BLOCK").click();
    await expect(page.getByText("Project Block")).toBeVisible();

    // Drag the project block.
    await expect(page.getByTestId("draggable")).toHaveCSS("top", "0px");
    await expect(page.getByTestId("draggable")).toHaveCSS("left", "0px");
    await page
      .getByText("Project Block")
      .dragTo(page.getByTestId("workspace-title"));
    // Center of Workspace title element located at (-x, 352), where -x is above the draggable
    // workspace area. Thus, the top value should not exceed 0px.
    await expect(page.getByTestId("draggable")).toHaveCSS("top", "0px");
    await expect(page.getByTestId("draggable")).toHaveCSS("left", "352px");

    // Add a project to the block.
    await page.getByText("Project Block").hover();
    await page.getByTestId("add-project-button").click();
    await expect(page.getByPlaceholder("Untitled")).toBeVisible();
    await page.getByPlaceholder("Untitled").fill("Project 1");
    await page.getByPlaceholder("Empty").fill("Project 1 description");
    await page
      .locator("#image")
      .setInputFiles("src/tests/integration/testImage.png");
    await page.keyboard.press("Escape");
    await expect(page.getByText("Project 1", { exact: true })).toBeVisible();
    await expect(page.getByText("Project 1 description")).toBeVisible();
    await expect(page.getByAltText("Project 1")).toBeVisible();

    // Edit the project.
    await page.getByText("Project 1", { exact: true }).click();
    await page.getByTestId("flowbite-card").click();
    await expect(page.getByText("Project 1", { exact: true })).toBeVisible();
    await page.getByPlaceholder("Untitled").fill("Project 2");
    await page.getByPlaceholder("Empty").fill("Project 2 description");
    await page.keyboard.press("Escape");
    await expect(page.getByText("Project 2", { exact: true })).toBeVisible();
    await expect(page.getByText("Project 2 description")).toBeVisible();

    // Add another project.
    await page.getByText("Project Block").hover();
    await page.getByTestId("add-project-button").click();
    await expect(page.getByPlaceholder("Untitled")).toBeVisible();
    await page.getByPlaceholder("Untitled").fill("Project 1");
    await page.getByPlaceholder("Empty").fill("Project 1 description");
    await page
      .locator("#image")
      .setInputFiles("src/tests/integration/testImage.png");
    await page.keyboard.press("Escape");
    await expect(page.getByText("Project 1", { exact: true })).toBeVisible();
    await expect(page.getByText("Project 1 description")).toBeVisible();
    await expect(page.getByAltText("Project 1")).toBeVisible();

    // Reorder the projects.
    let project1BoundingBox = await page
      .getByText("Project 1", { exact: true })
      .boundingBox();
    let project2BoundingBox = await page
      .getByText("Project 2", { exact: true })
      .boundingBox();
    if (project1BoundingBox === null || project2BoundingBox === null) {
      throw new Error("Project bounding box is null");
    }
    expect(project1BoundingBox.y).toBeGreaterThan(project2BoundingBox.y);
    // page.dragTo does not work for the sortable lists, so drag it manually.
    await page.mouse.move(
      project1BoundingBox.x + project1BoundingBox.width / 2,
      project1BoundingBox.y + project1BoundingBox.height / 2
    );
    await page.mouse.down();
    await page.mouse.move(
      project2BoundingBox.x + project2BoundingBox.width / 2,
      project2BoundingBox.y + project2BoundingBox.height / 2,
      { steps: 10 }
    );
    await page.mouse.up();
    // Wait for the reordering animation to finish.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    project1BoundingBox = await page
      .getByText("Project 1", { exact: true })
      .boundingBox();
    project2BoundingBox = await page
      .getByText("Project 2", { exact: true })
      .boundingBox();
    if (project1BoundingBox === null || project2BoundingBox === null) {
      throw new Error("Project bounding box is null");
    }
    expect(project1BoundingBox.y).toBeLessThan(project2BoundingBox.y);

    // Delete the project.
    await page.getByText("Project 2", { exact: true }).click();
    await page.getByTestId("edit-project-dropdown-button").click();
    await page.getByTestId("delete-project").click();
    await expect(
      page.getByText("Project 2", { exact: true })
    ).not.toBeVisible();

    // Delete the project block.
    await page.getByText("Project Block").hover();
    await page.getByTestId("project-dropdown-button").click();
    await page.getByTestId("delete-project-block").click();
    await page.getByTestId("confirm-deletion").click();
    await expect(page.getByText("Project block deleted!")).toBeVisible();
    await expect(page.getByText("Project Block")).not.toBeVisible();

    // Add a sticky note block.
    await page.getByText("+ ADD BLOCK").click();
    await page.getByText("Sticky Note").click();
    await expect(page.getByTestId("sticky-text")).toBeVisible();

    // Drag the sticky note block.
    await expect(page.getByTestId("draggable")).toHaveCSS("top", "0px");
    await expect(page.getByTestId("draggable")).toHaveCSS("left", "0px");
    await page.getByTestId("sticky-text").hover();
    await page
      .getByTestId("sticky-drag-button")
      .dragTo(page.getByTestId("workspace-title"));
    // Center of Workspace title element located at (-x, 224), where -x is above the draggable
    // workspace area. Thus, the top value should not exceed 0px.
    await expect(page.getByTestId("draggable")).toHaveCSS("top", "0px");
    await expect(page.getByTestId("draggable")).toHaveCSS("left", "192px");

    // Edit the sticky note.
    await page.getByTestId("sticky-text").dblclick();
    await page.getByRole("textbox").fill("Sticky note text");
    // Click outside of the sticky note.
    await page.getByText("+ ADD BLOCK", { exact: true }).click();
    await expect(page.getByTestId("sticky-text")).toHaveText(
      "Sticky note text"
    );

    // Delete the sticky note block.
    await page.getByTestId("sticky-text").hover();
    await page.getByTestId("sticky-dropdown-button").click();
    await page.getByTestId("delete-sticky-block").click();
    await page.getByTestId("confirm-deletion").click();
    await expect(page.getByText("Sticky note deleted!")).toBeVisible();
    await expect(page.getByTestId("sticky-text")).not.toBeVisible();
  });
});
