/** Unit tests for the project item. */

import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { blobToString } from "utils";
import { vi } from "vitest";

import ProjectItem from "./ProjectItem";

describe("Project item", () => {
  it("displays project item", async () => {
    const project = {
      _id: "1",
      name: "Project 1",
      imageId: "imageId",
      imageName: "testImage.png",
      description: "Project 1 description",
    };

    render(
      <ProjectItem
        style={undefined}
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
    expect(
      await screen.findByText("Project 1 description")
    ).toBeInTheDocument();
  });
});
