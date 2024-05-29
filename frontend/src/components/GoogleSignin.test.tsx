/** Unit tests for the Google signin button. */

import * as React from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";

import GoogleSignin from "./GoogleSignin";

describe("Google signin button", () => {
  it("displays sign in button", async () => {
    const queryClient = new QueryClient();
    // Requires it to be wrapped in a browser router so the sign in button can be loaded.
    const container = render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <GoogleSignin />
        </BrowserRouter>
      </QueryClientProvider>
    ).container;

    expect(
      await screen.findByText(/Please accept the terms of service/)
    ).toBeInTheDocument();
    expect(container.querySelector("#google_signin")).toBeInTheDocument();
  });
});
