/** Unit tests for the login screen. */

import * as React from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import Cookies from "js-cookie";
import { vi } from "vitest";

import api from "api";

import Login from "./Login";

describe("Login screen", () => {
  it("displays sign in button", async () => {
    const mockPost = vi.spyOn(api, "post");
    mockPost.mockRejectedValue({ status: 401 });
    const queryClient = new QueryClient();

    // Requires it to be wrapped in a browser router so the sign in button can be loaded.
    const container = render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </QueryClientProvider>
    ).container;

    expect(await screen.findByText("Welcome 👋!")).toBeInTheDocument();
    expect(container.querySelector("#google_signin")).toBeInTheDocument();
  });

  it("authenticates the user if already logged in", async () => {
    const mockPost = vi.spyOn(api, "post");
    mockPost.mockResolvedValue({
      status: 200,
      data: { subscriptionStatus: "active" },
    });
    const mockGet = vi.spyOn(api, "get");
    mockGet.mockResolvedValue({
      status: 200,
      data: [
        {
          _id: "abcdefg12345",
          userId: "abcdefg12345",
          name: "Workspace 1",
        },
      ],
    });
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(Cookies.get("authenticated")).toBe("true");
    });
  });
});
