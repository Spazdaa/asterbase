/** Unit tests for the checkout button. */

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import api from "api";

import CheckoutButton from "./CheckoutButton";

describe("Checkout button", () => {
  it("displays checkout button", async () => {
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
        <CheckoutButton />
      </QueryClientProvider>
    );

    await user.click(await screen.findByRole("button", { name: "Checkout" }));
    expect(mockPost).toHaveBeenCalledWith("/billing/checkout", {
      priceId: process.env.VITE_STRIPE_PRICE_ID,
      successUrl: "http://localhost:3000/login",
      cancelUrl: "http://localhost:3000/subscribe",
    });
  });
});
