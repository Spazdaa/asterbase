import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import api from "api";

import ResourceBlock from "./ResourceBlock";

describe("Resource block component", () => {
  it("displays resources", async () => {
    const mockGet = vi.spyOn(api, "get");
    mockGet.mockResolvedValue({
      status: 200,
      data: new Blob(),
    });
    const block = {
      _id: "1",
      type: "resource",
      x: 0,
      y: 0,
      createdAt: new Date(),
      resources: [
        {
          _id: "1",
          name: "Resource 1",
          imageId: "imageId",
          imageName: "testImage.png",
        },
      ],
    };
    const queryClient = new QueryClient();
    const defaultRef = React.createRef();

    render(
      <QueryClientProvider client={queryClient}>
        <ResourceBlock
          block={block}
          listeners={{}}
          setShowDeletionWarningModal={() => {}}
          ref={defaultRef}
          mostRecentBlock={false}
        />
      </QueryClientProvider>
    );
    expect(await screen.findByText("Resource Block")).toBeInTheDocument();
    expect(await screen.findByText("Resource 1")).toBeInTheDocument();
    // Doesn't load in instantly, so wait for it.
    await waitFor(async () => {
      expect(
        await screen.findByRole("img", { name: "Resource 1" })
      ).toBeInTheDocument();
    });
  });

  it("can open the edit resource modal to add a new resource", async () => {
    const block = {
      _id: "1",
      type: "resource",
      x: 0,
      y: 0,
      createdAt: new Date(),
      resources: [],
    };
    const user = userEvent.setup();
    const queryClient = new QueryClient();
    const defaultRef: React.RefObject<any> = React.createRef();

    render(
      <QueryClientProvider client={queryClient}>
        <ResourceBlock
          block={block}
          listeners={{}}
          setShowDeletionWarningModal={() => {}}
          ref={defaultRef}
          mostRecentBlock={false}
        />
      </QueryClientProvider>
    );
    await user.hover(await screen.findByText("Resource Block"));
    expect(await screen.findByTestId("add-resource-button")).toBeVisible();
    await user.click(await screen.findByTestId("add-resource-button"));
    expect(
      await screen.findByRole("dialog", { hidden: false })
    ).toBeInTheDocument();
  });

  it("can display the deletion modal", async () => {
    const block = {
      _id: "1",
      type: "resource",
      x: 0,
      y: 0,
      createdAt: new Date(),
      resources: [],
    };
    const user = userEvent.setup();
    const mockDelete = vi.spyOn(api, "delete");
    mockDelete.mockResolvedValue({
      status: 204,
    });
    const queryClient = new QueryClient();
    const defaultRef: React.RefObject<any> = React.createRef();
    const setShowDeletionWarningModalMock = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <ResourceBlock
          block={block}
          listeners={{}}
          setShowDeletionWarningModal={setShowDeletionWarningModalMock}
          ref={defaultRef}
          mostRecentBlock={false}
        />
      </QueryClientProvider>
    );
    await user.hover(await screen.findByText("Resource Block"));
    expect(await screen.findByTestId("resource-dropdown-button")).toBeVisible();
    await user.click(await screen.findByTestId("resource-dropdown-button"));
    expect(await screen.findByTestId("delete-resource-block")).toBeVisible();
    await user.click(await screen.findByTestId("delete-resource-block"));
    expect(setShowDeletionWarningModalMock).toBeCalled();
  });

  it("can open the edit resource modal to edit an existing resource", async () => {
    const block = {
      _id: "1",
      type: "resource",
      x: 0,
      y: 0,
      createdAt: new Date(),
      resources: [
        {
          _id: "1",
          name: "Resource 1",
        },
      ],
    };
    const user = userEvent.setup();
    const queryClient = new QueryClient();
    const defaultRef: React.RefObject<any> = React.createRef();

    render(
      <QueryClientProvider client={queryClient}>
        <ResourceBlock
          block={block}
          listeners={{}}
          setShowDeletionWarningModal={() => {}}
          ref={defaultRef}
          mostRecentBlock={false}
        />
      </QueryClientProvider>
    );
    await user.click(await screen.findByText("Resource 1"));
    expect(
      await screen.findByRole("dialog", { hidden: false })
    ).toBeInTheDocument();
  });

  it("displays on top of all other blocks if it is the most recent block", async () => {
    const block = {
      _id: "1",
      type: "resource",
      x: 0,
      y: 0,
      createdAt: new Date(),
      resources: [
        {
          _id: "1",
          name: "Resource 1",
        },
      ],
    };

    const queryClient = new QueryClient();
    const defaultRef: React.RefObject<any> = React.createRef();

    render(
      <QueryClientProvider client={queryClient}>
        <ResourceBlock
          block={block}
          listeners={{}}
          setShowDeletionWarningModal={() => {}}
          ref={defaultRef}
          mostRecentBlock={true}
        />
      </QueryClientProvider>
    );

    const resourceBlock = screen.getByTestId("flowbite-card");
    expect(resourceBlock).toHaveClass("z-10");
  });

  it("does not display on top of all other blocks if it is not the most recent block", async () => {
    const block = {
      _id: "1",
      type: "resource",
      x: 0,
      y: 0,
      createdAt: new Date(),
      resources: [
        {
          _id: "1",
          name: "Resource 1",
        },
      ],
    };

    const queryClient = new QueryClient();
    const defaultRef: React.RefObject<any> = React.createRef();

    render(
      <QueryClientProvider client={queryClient}>
        <ResourceBlock
          block={block}
          listeners={{}}
          setShowDeletionWarningModal={() => {}}
          ref={defaultRef}
          mostRecentBlock={false}
        />
      </QueryClientProvider>
    );

    const resourceBlock = screen.getByTestId("flowbite-card");
    expect(resourceBlock).not.toHaveClass("z-10");
  });
});
