import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import api from "api";

import StickyBlock from "./StickyBlock";

describe("Sticky note block component", () => {
  beforeEach(() => {
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  });

  it("displays sticky notes", async () => {
    const queryClient = new QueryClient();
    const block = {
      _id: "1",
      type: "sticky",
      x: 0,
      y: 0,
      createdAt: new Date(),
      height: 80,
      width: 80,
      stickyText: "Sticky note text",
    };
    const defaultRef: React.RefObject<any> = React.createRef();

    render(
      <QueryClientProvider client={queryClient}>
        <StickyBlock
          block={block}
          listeners={{}}
          setShowDeletionWarningModal={() => {}}
          ref={defaultRef}
          mostRecentBlock={false}
        />
      </QueryClientProvider>
    );

    expect(await screen.findByTestId("sticky-text")).toHaveTextContent(
      "Sticky note text"
    );
  });

  it("can edit the sticky note content", async () => {
    const queryClient = new QueryClient();
    const block = {
      _id: "1",
      type: "sticky",
      x: 0,
      y: 0,
      createdAt: new Date(),
      height: 80,
      width: 80,
      stickyText: "Sticky note text",
    };
    const user = userEvent.setup();
    const mockPatch = vi.spyOn(api, "patch");
    mockPatch.mockResolvedValue({
      status: 204,
    });
    const defaultRef: React.RefObject<any> = React.createRef();

    render(
      <QueryClientProvider client={queryClient}>
        <StickyBlock
          block={block}
          listeners={{}}
          setShowDeletionWarningModal={() => {}}
          ref={defaultRef}
          mostRecentBlock={false}
        />
      </QueryClientProvider>
    );

    await user.click(await screen.findByTestId("sticky-text"));
    await user.type(await screen.findByTestId("sticky-text"), " edited");
    await user.click(document.body);
    expect(mockPatch).toBeCalled();
  });

  it("can display the deletion modal", async () => {
    const queryClient = new QueryClient();
    const block = {
      _id: "1",
      type: "sticky",
      x: 0,
      y: 0,
      createdAt: new Date(),
      height: 80,
      width: 80,
      stickyText: "Sticky note text",
    };
    const user = userEvent.setup();
    const mockDelete = vi.spyOn(api, "delete");
    mockDelete.mockResolvedValue({
      status: 204,
    });
    const mockPatch = vi.spyOn(api, "patch");
    mockPatch.mockResolvedValue({
      status: 204,
    });
    const defaultRef: React.RefObject<any> = React.createRef();
    const setShowDeletionWarningModalMock = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <StickyBlock
          block={block}
          listeners={{}}
          setShowDeletionWarningModal={setShowDeletionWarningModalMock}
          ref={defaultRef}
          mostRecentBlock={false}
        />
      </QueryClientProvider>
    );

    await user.hover(await screen.findByTestId("sticky-text"));
    expect(await screen.findByTestId("sticky-dropdown-button")).toBeVisible();
    await user.click(await screen.findByTestId("sticky-dropdown-button"));
    expect(await screen.findByTestId("delete-sticky-block")).toBeVisible();
    await user.click(await screen.findByTestId("delete-sticky-block"));
    expect(setShowDeletionWarningModalMock).toBeCalled();
  });

  it("displays on top of all other blocks if it is the most recent block", async () => {
    const queryClient = new QueryClient();
    const block = {
      _id: "1",
      type: "sticky",
      x: 0,
      y: 0,
      createdAt: new Date(),
      height: 80,
      width: 80,
      stickyText: "Sticky note text",
    };

    const defaultRef: React.RefObject<any> = React.createRef();
    const setShowDeletionWarningModalMock = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <StickyBlock
          block={block}
          listeners={{}}
          setShowDeletionWarningModal={setShowDeletionWarningModalMock}
          ref={defaultRef}
          mostRecentBlock={true}
        />
      </QueryClientProvider>
    );

    const card = screen.getByTestId("flowbite-card");
    expect(card).toHaveClass("z-10");
  });

  it("does not display on top of all other blocks if it is not the most recent block", async () => {
    const queryClient = new QueryClient();
    const block = {
      _id: "1",
      type: "sticky",
      x: 0,
      y: 0,
      createdAt: new Date(),
      height: 80,
      width: 80,
      stickyText: "Sticky note text",
    };

    const defaultRef: React.RefObject<any> = React.createRef();
    const setShowDeletionWarningModalMock = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <StickyBlock
          block={block}
          listeners={{}}
          setShowDeletionWarningModal={setShowDeletionWarningModalMock}
          ref={defaultRef}
          mostRecentBlock={false}
        />
      </QueryClientProvider>
    );

    const stickyBlock = screen.getByTestId("flowbite-card");
    expect(stickyBlock).not.toHaveClass("z-10");
  });
});
