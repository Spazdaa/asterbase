import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import api from "api";

import EditResourceModal from "./EditResourceModal";

describe("Edit resource modal component", () => {
  it("displays form", async () => {
    const resource = {
      _id: "1",
      name: "Resource 1",
      imageId: "abcdefg1234",
      imageName: "testImage.png",
      notes: "Resource notes",
    };
    const onClose = vi.fn();
    const queryClient = new QueryClient();
    // Mock the window location since jsdom doesn't support navigation in Jest.
    // eslint-disable-next-line no-global-assign
    window = Object.create(window);
    Object.defineProperty(window, "location", {
      value: {
        reload: vi.fn(),
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <EditResourceModal
          blockId="blockId"
          resource={resource}
          show={true}
          onClose={onClose}
        />
      </QueryClientProvider>
    );

    expect(await screen.findByDisplayValue("Resource 1")).toBeInTheDocument();
    expect(await screen.findByText("Resource Icon")).toBeInTheDocument();
  });

  it("edits a resource", async () => {
    const resource = {
      _id: "1",
      name: "Resource 1",
      imageId: "abcdefg1234",
      imageName: "testImage.png",
      notes: "Resource notes",
    };
    const onClose = vi.fn();
    const user = userEvent.setup();
    const mockPatch = vi.spyOn(api, "patch");
    mockPatch.mockResolvedValue({
      status: 204,
    });
    const queryClient = new QueryClient();
    // Mock the window location since jsdom doesn't support navigation in Jest.
    // eslint-disable-next-line no-global-assign
    window = Object.create(window);
    Object.defineProperty(window, "location", {
      value: {
        reload: vi.fn(),
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <EditResourceModal
          blockId="blockId"
          resource={resource}
          show={true}
          onClose={onClose}
        />
      </QueryClientProvider>
    );

    await user.type(await screen.findByDisplayValue("Resource 1"), " edited");
    await user.upload(
      await screen.findByLabelText("Current file: testImage.png"),
      new File(["testImageEdited"], "testImageEdited.png", {
        type: "image/png",
      })
    );

    await user.keyboard("[Escape]");

    expect(mockPatch).toBeCalled();
  });

  it("adds a resource", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    const mockPost = vi.spyOn(api, "post");
    mockPost.mockResolvedValue({
      status: 201,
    });
    const queryClient = new QueryClient();
    // Mock the window location since jsdom doesn't support navigation in Jest.
    // eslint-disable-next-line no-global-assign
    window = Object.create(window);
    Object.defineProperty(window, "location", {
      value: {
        reload: vi.fn(),
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <EditResourceModal
          blockId="blockId"
          resource={undefined}
          show={true}
          onClose={onClose}
        />
      </QueryClientProvider>
    );

    // Test with no fields filled in.
    await user.clear(await screen.findByDisplayValue("Untitled"));
    await user.keyboard("[Escape]");

    expect(mockPost).toBeCalled();
  });

  it("deletes a resource", async () => {
    const resource = {
      _id: "1",
      name: "Resource 1",
      imageId: "abcdefg1234",
      imageName: "testImage.png",
      notes: "Resource notes",
    };
    const onClose = vi.fn();
    const user = userEvent.setup();

    const mockDelete = vi.spyOn(api, "delete");
    mockDelete.mockResolvedValue({
      status: 204,
    });
    const queryClient = new QueryClient();
    // Mock the window location since jsdom doesn't support navigation in Jest.
    // eslint-disable-next-line no-global-assign
    window = Object.create(window);
    Object.defineProperty(window, "location", {
      value: {
        reload: vi.fn(),
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <EditResourceModal
          blockId="blockId"
          resource={resource}
          show={true}
          onClose={onClose}
        />
      </QueryClientProvider>
    );

    expect(await screen.findByTestId("delete-resource")).toBeVisible();
    await user.click(await screen.findByTestId("delete-resource"));

    expect(mockDelete).toBeCalled();
  });

  it("hides when the show prop is false", async () => {
    const resource = {
      _id: "1",
      name: "Resource 1",
      imageId: "abcdefg1234",
      imageName: "testImage.png",
      notes: "Resource notes",
    };
    const onClose = vi.fn();
    const queryClient = new QueryClient();
    // Mock the window location since jsdom doesn't support navigation in Jest.
    // eslint-disable-next-line no-global-assign
    window = Object.create(window);
    Object.defineProperty(window, "location", {
      value: {
        reload: vi.fn(),
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <EditResourceModal
          blockId="blockId"
          resource={resource}
          show={false}
          onClose={onClose}
        />
      </QueryClientProvider>
    );

    expect(
      await screen.findByRole("dialog", { hidden: true })
    ).toBeInTheDocument();
  });
});
