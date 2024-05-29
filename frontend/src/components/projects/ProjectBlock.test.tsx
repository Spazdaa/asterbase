import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import api from "api";

import ProjectBlock from "./ProjectBlock";

describe("Project block component", () => {
  it("displays projects", async () => {
    const mockGet = vi.spyOn(api, "get");
    mockGet.mockResolvedValue({
      status: 200,
      data: new Blob(),
    });
    const block = {
      _id: "1",
      type: "project",
      x: 0,
      y: 0,
      createdAt: new Date(),
      projects: [
        {
          _id: "1",
          name: "Project 1",
          imageId: "imageId",
          imageName: "testImage.png",
          description: "Project 1 description",
        },
      ],
    };
    const queryClient = new QueryClient();
    const defaultRef: React.RefObject<any> = React.createRef();

    render(
      <QueryClientProvider client={queryClient}>
        <ProjectBlock
          block={block}
          listeners={{}}
          setShowDeletionWarningModal={() => {}}
          ref={defaultRef}
          mostRecentBlock={false}
        />
      </QueryClientProvider>
    );
    expect(await screen.findByText("Project Block")).toBeInTheDocument();
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

  it("can open the edit project modal to add a new project", async () => {
    const block = {
      _id: "1",
      type: "project",
      x: 0,
      y: 0,
      createdAt: new Date(),
      projects: [],
    };
    const user = userEvent.setup();
    const queryClient = new QueryClient();
    const defaultRef: React.RefObject<any> = React.createRef();

    render(
      <QueryClientProvider client={queryClient}>
        <ProjectBlock
          block={block}
          listeners={{}}
          setShowDeletionWarningModal={() => {}}
          ref={defaultRef}
          mostRecentBlock={false}
        />
      </QueryClientProvider>
    );
    await user.hover(await screen.findByText("Project Block"));
    expect(await screen.findByTestId("add-project-button")).toBeVisible();
    await user.click(await screen.findByTestId("add-project-button"));
    expect(
      await screen.findByRole("dialog", { hidden: false })
    ).toBeInTheDocument();
  });

  it("can delete the block if the user confirms deletion", async () => {
    const block = {
      _id: "1",
      type: "project",
      x: 0,
      y: 0,
      createdAt: new Date(),
      projects: [],
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
        <ProjectBlock
          block={block}
          listeners={{}}
          setShowDeletionWarningModal={setShowDeletionWarningModalMock}
          ref={defaultRef}
          mostRecentBlock={false}
        />
      </QueryClientProvider>
    );
    await user.hover(await screen.findByText("Project Block"));
    expect(await screen.findByTestId("project-dropdown-button")).toBeVisible();
    await user.click(await screen.findByTestId("project-dropdown-button"));
    expect(await screen.findByTestId("delete-project-block")).toBeVisible();
    await user.click(await screen.findByTestId("delete-project-block"));
    expect(setShowDeletionWarningModalMock).toBeCalled();
  });

  it("can open the edit project modal to edit an existing project", async () => {
    const block = {
      _id: "1",
      type: "project",
      x: 0,
      y: 0,
      createdAt: new Date(),
      projects: [
        {
          _id: "1",
          name: "Project 1",
        },
      ],
    };
    const user = userEvent.setup();
    const queryClient = new QueryClient();
    const defaultRef: React.RefObject<any> = React.createRef();

    render(
      <QueryClientProvider client={queryClient}>
        <ProjectBlock
          block={block}
          listeners={{}}
          setShowDeletionWarningModal={() => {}}
          ref={defaultRef}
          mostRecentBlock={false}
        />
      </QueryClientProvider>
    );
    await user.click(await screen.findByText("Project 1"));
    expect(
      await screen.findByRole("dialog", { hidden: false })
    ).toBeInTheDocument();
  });

  it("displays on top of all other blocks if it is the most recent block", async () => {
    const block = {
      _id: "1",
      type: "project",
      x: 0,
      y: 0,
      createdAt: new Date(),
      projects: [
        {
          _id: "1",
          name: "Project 1",
        },
      ],
    };

    const queryClient = new QueryClient();
    const defaultRef: React.RefObject<any> = React.createRef();

    render(
      <QueryClientProvider client={queryClient}>
        <ProjectBlock
          block={block}
          listeners={{}}
          setShowDeletionWarningModal={() => {}}
          ref={defaultRef}
          mostRecentBlock={true}
        />
      </QueryClientProvider>
    );
    const projectBlock = screen.getByTestId("flowbite-card");
    expect(projectBlock).toHaveClass("z-10");
  });

  it("does not display on top of all other blocks if it is not the most recent block", async () => {
    const block = {
      _id: "1",
      type: "project",
      x: 0,
      y: 0,
      createdAt: new Date(),
      projects: [
        {
          _id: "1",
          name: "Project 1",
        },
      ],
    };

    const queryClient = new QueryClient();
    const defaultRef: React.RefObject<any> = React.createRef();

    render(
      <QueryClientProvider client={queryClient}>
        <ProjectBlock
          block={block}
          listeners={{}}
          setShowDeletionWarningModal={() => {}}
          ref={defaultRef}
          mostRecentBlock={false}
        />
      </QueryClientProvider>
    );
    const projectBlock = screen.getByTestId("flowbite-card");
    expect(projectBlock).not.toHaveClass("z-10");
  });
});
