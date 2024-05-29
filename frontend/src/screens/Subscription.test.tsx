/** Unit tests for the subscription screen. */

import * as React from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";

import Subscription from "./Subscription";

describe("Subscription screen", () => {
  it("displays subscription actions", async () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Subscription />
        </BrowserRouter>
      </QueryClientProvider>
    );
    expect(
      await screen.findByText(
        "Thanks for creating an account and for your interest in Asterspark!"
      )
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: "Checkout" })
    ).toBeInTheDocument();
  });
});
