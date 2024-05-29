/** Unit tests for the workspace screen. */

import * as React from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import api from "api";

import Workspace, { findNewestBlock } from "./Workspace";

describe("Workspace screen", () => {
  it("displays workspace", async () => {
    const mockGet = vi.spyOn(api, "get");
    mockGet.mockResolvedValue({
      status: 200,
      data: [
        {
          _id: "blockId",
          type: "resource",
          workspaceId: "workspaceId",
          x: 0,
          y: 0,
          resources: [],
        },
      ],
    });
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Workspace />
        </BrowserRouter>
      </QueryClientProvider>
    );

    // Ignore the workspace text on the sidebar.
    expect(await screen.findByText("Workspace")).toBeInTheDocument();
    expect(await screen.findByText("Resource Block")).toBeInTheDocument();
  });

  it("adds block to workspace", async () => {
    const user = userEvent.setup();
    const mockPost = vi.spyOn(api, "post");
    mockPost.mockResolvedValue({
      status: 201,
    });
    const mockGet = vi.spyOn(api, "get");
    mockGet.mockResolvedValue({
      status: 200,
      data: [],
    });
    const queryClient = new QueryClient();
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Toaster />
          <Workspace />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(async () => {
      expect(
        await screen.findByRole("button", { name: "+ ADD BLOCK" })
      ).toBeInTheDocument();
    });
    await user.click(
      await screen.findByRole("button", { name: "+ ADD BLOCK" })
    );
    expect(await screen.findByText("Add a New Block")).toBeVisible();
    expect(await screen.findByText("Basic")).toBeVisible();
    expect(await screen.findByText("Sticky Note")).toBeVisible();
    expect(await screen.findByText("Projects")).toBeVisible();
    expect(await screen.findByText("Resources")).toBeVisible();
    await user.click(await screen.findByText("Resources"));
    expect(mockPost).toBeCalled();
    expect(await screen.findByText("Block created!")).toBeInTheDocument();
  });

  describe("Workspace Block Layering By Date Calculation", () => {
    it("properly finds the newest blocks when all createdAt dates are present", () => {
      const blocksArray: Block[] = [
        {
          _id: "1",
          type: "resource",
          x: 0,
          y: 0,
          createdAt: new Date(2023, 7, 21),
        },
        {
          _id: "2",
          type: "resource",
          x: 0,
          y: 0,
          createdAt: new Date(2023, 7, 23), // Newest block
        },
        {
          _id: "3",
          type: "resource",
          x: 0,
          y: 0,
          createdAt: new Date(2023, 7, 19),
        },
        {
          _id: "4",
          type: "resource",
          x: 0,
          y: 0,
          createdAt: new Date(2023, 6, 10),
        },
      ];

      const newestBlock = findNewestBlock(blocksArray);
      expect(newestBlock._id).toBe("2");
    });

    it("properly finds the newest block when all some createdAt dates are missing", () => {
      // If old blocks are missing a createdAt property, that does not matter as long as at least one newer block has a time stamp
      const blocksArray: Block[] = [
        {
          _id: "1",
          type: "resource",
          x: 0,
          y: 0,
          createdAt: undefined,
        },
        {
          _id: "2",
          type: "resource",
          x: 0,
          y: 0,
          createdAt: new Date(2023, 7, 23), // Newest block
        },
        {
          _id: "3",
          type: "resource",
          x: 0,
          y: 0,
          createdAt: new Date(2023, 7, 19),
        },
        {
          _id: "4",
          type: "resource",
          x: 0,
          y: 0,
          createdAt: undefined,
        },
      ];

      const newestBlock = findNewestBlock(blocksArray);
      expect(newestBlock._id).toBe("2");
    });

    it("properly finds the newest block when all createdAt properties are missing", () => {
      const blocksArray: Block[] = [
        {
          _id: "1",
          type: "resource",
          x: 0,
          y: 0,
          createdAt: undefined,
        },
        {
          _id: "2",
          type: "resource",
          x: 0,
          y: 0,
          createdAt: undefined,
        },
        {
          _id: "3",
          type: "resource",
          x: 0,
          y: 0,
          createdAt: undefined,
        },
        {
          _id: "4",
          type: "resource",
          x: 0,
          y: 0,
          createdAt: undefined,
        },
      ];

      // Defaults to returning the first block in the array
      const newestBlock = findNewestBlock(blocksArray);
      expect(newestBlock._id).toBe("1");
    });
  });
});
