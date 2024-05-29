import * as React from "react";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import api from "api";

import SkillBlock from "./SkillBlock";

describe("Skill block component", () => {
  it("displays skill details", async () => {
    const mockGet = vi.spyOn(api, "get");
    mockGet.mockResolvedValue({
      status: 200,
      data: new Blob(),
    });
    const skill = {
      _id: "skillId",
      name: "Skill 1",
      bgColour: "bg-red-300",
      textColour: "text-red-400",
      imageId: "imageId",
    };
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <SkillBlock skill={skill} />
      </QueryClientProvider>
    );
    expect(await screen.findByText("Skill 1")).toBeInTheDocument();
    expect(await screen.findByText("Skill 1")).toHaveStyle({
      backgroundColor: "rgb(252 165 165)",
      color: "rgb(248 113 113)",
    });
    // Doesn't load in instantly, so wait for it.
    await waitFor(async () => {
      expect(
        await screen.findByRole("img", { name: "Skill 1" })
      ).toBeInTheDocument();
    });
  });

  it("can be deleted", async () => {
    const skill = {
      _id: "skillId",
      name: "Skill 1",
      bgColour: "bg-red-300",
      textColour: "text-red-400",
      imageId: "imageId",
    };
    const user = userEvent.setup();
    const mockDelete = vi.spyOn(api, "delete");
    mockDelete.mockResolvedValue({
      status: 204,
    });
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <SkillBlock skill={skill} />
      </QueryClientProvider>
    );
    await user.hover(await screen.findByText("Skill 1"));
    expect(await screen.findByTestId("skill-dropdown-button")).toBeVisible();
    await user.click(await screen.findByTestId("skill-dropdown-button"));
    expect(await screen.findByTestId("delete-skill")).toBeVisible();
    await user.click(await screen.findByTestId("delete-skill"));
    expect(mockDelete).toBeCalled();
    expect(await screen.findByText("Skill deleted!")).toBeInTheDocument();
  });
});
