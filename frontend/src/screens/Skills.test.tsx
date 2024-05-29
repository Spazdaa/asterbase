/** Unit tests for the skills screen. */

import * as React from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import api from "api";

import Skills from "./Skills";

describe("Skills screen", () => {
  it("displays user skills", async () => {
    const mockGet = vi.spyOn(api, "get");
    mockGet.mockImplementation(async (url: string) => {
      if (url === "/skills") {
        return {
          status: 200,
          data: [
            {
              _id: "skillId",
              name: "Skill 1",
              bgColour: "bg-red-300",
              textColour: "text-red-400",
              imageId: "imageId",
            },
          ],
        };
      } else if (url === "/skills/users") {
        return {
          status: 200,
          data: ["skillId"],
        };
      } else if (url === "/skills/images/imageId") {
        return {
          status: 200,
          data: new Blob(),
        };
      } else if (url === "/workspaces") {
        return {
          status: 200,
          data: [],
        };
      }
    });
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Skills />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByTestId("skills-title")).toBeInTheDocument();
    expect(await screen.findByText("Skill 1")).toBeInTheDocument();
  });

  it("adds a new user skill", async () => {
    const user = userEvent.setup();
    const mockPost = vi.spyOn(api, "post");
    mockPost.mockResolvedValue({
      status: 204,
    });
    const mockGet = vi.spyOn(api, "get");
    mockGet.mockImplementation(async (url: string) => {
      if (url === "/skills") {
        return {
          status: 200,
          data: [
            {
              _id: "skillId",
              name: "Skill 1",
              bgColour: "bg-red-300",
              textColour: "text-red-400",
              imageId: "imageId",
            },
          ],
        };
      } else if (url === "/skills/users") {
        return {
          status: 200,
          data: ["skillId"],
        };
      } else if (url === "/skills/images/imageId") {
        return {
          status: 200,
          data: new Blob(),
        };
      } else if (url === "/workspaces") {
        return {
          status: 200,
          data: [],
        };
      }
    });
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Toaster />
          <Skills />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByRole("combobox")).toBeInTheDocument();
    await user.click(await screen.findByRole("combobox"));
    expect(
      await screen.findByRole("option", { name: "Skill 1" })
    ).toBeVisible();
    await user.click(await screen.findByRole("option", { name: "Skill 1" }));
    expect(mockPost).toBeCalled();
    expect(await screen.findByText("Skill added!")).toBeInTheDocument();
  });
});
