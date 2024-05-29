/** Unit tests for the portal button. */

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import api from "api";

import PortalButton from "./PortalButton";

describe("Portal button", () => {
  it("displays portal button", async () => {
    const mockPost = vi.spyOn(api, "post");
    mockPost.mockResolvedValue({
      status: 200,
      data: { url: "http://localhost:3000" },
    });
    // Mock the window location since jsdom doesn't support navigation in Jest.
    // eslint-disable-next-line no-global-assign
    window = Object.create(window);
    Object.defineProperty(window, "location", {
      value: {
        href: "",
        protocol: "http:",
        host: "localhost:3000",
      },
    });
    const queryClient = new QueryClient();

    const user = userEvent.setup();
    render(
      <QueryClientProvider client={queryClient}>
        <PortalButton />
      </QueryClientProvider>
    );

    await user.click(
      await screen.findByRole("button", { name: "Manage Subscription" })
    );
    expect(mockPost).toHaveBeenCalledWith("/billing/portal", {
      returnUrl: "http://localhost:3000/settings",
    });
  });
});
