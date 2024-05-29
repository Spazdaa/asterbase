/** Unit tests for the sidebar component. */

import * as React from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import api from "api";

import Sidebar from "./Sidebar";

describe("Sidebar component", () => {
  it("displays sidebar", async () => {
    const mockGet = vi.spyOn(api, "get");
    mockGet.mockResolvedValue({
      status: 200,
      data: [],
    });
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Sidebar />
        </BrowserRouter>
      </QueryClientProvider>
    );
    expect(await screen.findByText("Asterspark")).toBeInTheDocument();
    // Doesn't load in instantly, so wait for it.
    await waitFor(async () => {
      expect(await screen.findByText("Workspace")).toBeVisible();
    });
    expect(await screen.findByText("My Skills")).toBeInTheDocument();
    expect(await screen.findByText("Gunther AI")).toBeInTheDocument();
    expect(await screen.findByText("Settings")).toBeInTheDocument();
  });
});
