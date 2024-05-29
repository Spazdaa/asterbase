/** Unit tests for the settings screen. */

import * as React from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import api from "api";

import Settings from "./Settings";

describe("Settings screen", () => {
  it("displays settings", async () => {
    // Mock the API call to get the user's workspaces for the sidebar.
    const mockGet = vi.spyOn(api, "get");
    mockGet.mockResolvedValue({
      status: 200,
      data: [],
    });
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Settings />
        </BrowserRouter>
      </QueryClientProvider>
    );
    // Ignore the workspace text on the sidebar.
    expect(await screen.findByText("User Settings")).toBeInTheDocument();
    expect(await screen.findByText("Account")).toBeInTheDocument();
    expect(
      await screen.findByText(
        "Please email us at asterbasehq@gmail.com if you would like to delete your account."
      )
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: "Logout" })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: "Manage Subscription" })
    ).toBeInTheDocument();
  });
});
