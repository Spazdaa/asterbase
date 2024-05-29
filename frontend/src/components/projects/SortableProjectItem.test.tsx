/** Unit tests for the sortable wrapper on project items. */

import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { blobToString } from "utils";
import { vi } from "vitest";

import SortableProjectItem from "./SortableProjectItem";

describe("Sortable project item", () => {
  it("displays sortable project item", async () => {
    const project = {
      _id: "1",
      name: "Project 1",
      imageId: "imageId",
      imageName: "testImage.png",
    };

    render(
      <SortableProjectItem
        onClick={vi.fn()}
        project={project}
        images={{ imageId: await blobToString(new Blob()) }}
      />
    );

    expect(await screen.findByText("Project 1")).toBeInTheDocument();
    // Doesn't load in instantly, so wait for it.
    await waitFor(async () => {
      expect(
        await screen.findByRole("img", { name: "Project 1" })
      ).toBeInTheDocument();
    });
  });
});
