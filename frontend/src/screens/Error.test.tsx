/** Unit tests for the error screen. */

import * as React from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import api from "api";

import Error from "./Error";

describe("Error screen", () => {
  it("displays error message", async () => {
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
          <Error />
        </BrowserRouter>
      </QueryClientProvider>
    );
    expect(await screen.findByText("Asterspark")).toBeInTheDocument();
    expect(await screen.findByText("Page Does Not Exist")).toBeInTheDocument();
  });
});
