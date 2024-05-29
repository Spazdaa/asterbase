/** Unit tests for the sign out button. */

import * as React from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Cookies from "js-cookie";
import { vi } from "vitest";

import api from "api";

import GoogleSignout from "./GoogleSignout";

describe("Google signout button", () => {
  it("displays sign out button", async () => {
    const mockPost = vi.spyOn(api, "post");
    mockPost.mockResolvedValue({ status: 201 });
    const queryClient = new QueryClient();

    const user = userEvent.setup();
    Cookies.set("authenticated", "true");
    // Requires it to be wrapped in a browser router so the sign in button can be loaded.
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <GoogleSignout />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(
      await screen.findByRole("button", { name: "Logout" })
    ).toBeInTheDocument();
    await user.click(await screen.findByRole("button", { name: "Logout" }));
    expect(Cookies.get("authenticated")).toBeUndefined();
  });
});
