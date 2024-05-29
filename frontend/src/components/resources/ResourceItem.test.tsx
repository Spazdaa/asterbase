/** Unit tests for the resource item. */

import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { blobToString } from "utils";
import { vi } from "vitest";

import ResourceItem from "./ResourceItem";

describe("Resource item", () => {
  it("displays resource item", async () => {
    const resource = {
      _id: "1",
      name: "Resource 1",
      imageId: "imageId",
      imageName: "testImage.png",
    };

    render(
      <ResourceItem
        style={undefined}
        onClick={vi.fn()}
        resource={resource}
        images={{ imageId: await blobToString(new Blob()) }}
      />
    );

    expect(await screen.findByText("Resource 1")).toBeInTheDocument();
    // Doesn't load in instantly, so wait for it.
    await waitFor(async () => {
      expect(
        await screen.findByRole("img", { name: "Resource 1" })
      ).toBeInTheDocument();
    });
  });
});
