/** Unit tests for the Gunther AI screen. */

import * as React from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import api from "api";

import Gunther from "./Gunther";

describe("Gunther AI screen", () => {
  it("displays chat interface", async () => {
    const mockGet = vi.spyOn(api, "get");
    mockGet.mockImplementation(async () => {
      return { status: 200, data: { sessions: 15 } };
    });
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Gunther />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByTestId("gunther-title")).toBeInTheDocument();
    // Check for starting message.
    expect(await screen.findByText(/This is a study tool/)).toBeInTheDocument();
    // Check number of remaining sessions is displayed correctly.
    expect(
      await screen.findByText(/You have 15 study sessions/)
    ).toBeInTheDocument();
  });

  it("enters a chat message and starts a session", async () => {
    const user = userEvent.setup();
    const mockPost = vi.spyOn(api, "post");
    mockPost.mockResolvedValue({
      status: 204,
    });
    const mockGet = vi.spyOn(api, "get");
    mockGet.mockImplementation(async () => {
      return { status: 200, data: { sessions: 15 } };
    });
    const queryClient = new QueryClient();
    // Mock scrollINtoView since it is not implemented in JSDOM.
    window.HTMLElement.prototype.scrollIntoView = () => {};

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Gunther />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByRole("textbox")).toBeInTheDocument();
    await user.type(await screen.findByRole("textbox"), "Test message");
    await user.click(await screen.findByText("Send"));
    expect(mockPost).toBeCalled();
  });
});
