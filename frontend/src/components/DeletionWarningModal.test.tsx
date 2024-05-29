import * as React from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import DeletionWarningModal from "./DeletionWarningModal";

describe("Deletion warning modal", () => {
  it("displays the deletion warning modal", async () => {
    const queryClient = new QueryClient();
    const mockOnConfirm = vi.fn();
    const mockOnCancel = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <DeletionWarningModal
            isOpen={true}
            onCancel={mockOnCancel}
            onConfirm={mockOnConfirm}
          />
        </BrowserRouter>
      </QueryClientProvider>
    );
    expect(await screen.findByRole("dialog")).toBeVisible();
  });

  it("displays does not display the deletion warning modal", async () => {
    const queryClient = new QueryClient();
    const mockOnConfirm = vi.fn();
    const mockOnCancel = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <DeletionWarningModal
            isOpen={false}
            onCancel={mockOnCancel}
            onConfirm={mockOnConfirm}
          />
        </BrowserRouter>
      </QueryClientProvider>
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("calls the correct callback to confirm deletion", async () => {
    const queryClient = new QueryClient();
    const user = userEvent.setup();
    const mockOnConfirm = vi.fn();
    const mockOnCancel = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <DeletionWarningModal
            isOpen={true}
            onCancel={mockOnCancel}
            onConfirm={mockOnConfirm}
          />
        </BrowserRouter>
      </QueryClientProvider>
    );
    expect(await screen.findByTestId("deletion-modal")).toBeVisible();
    await user.click(await screen.findByTestId("confirm-deletion"));
    expect(mockOnConfirm).toHaveBeenCalled();
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it("calls the correct callback to cancel deletion", async () => {
    const queryClient = new QueryClient();
    const user = userEvent.setup();
    const mockOnConfirm = vi.fn();
    const mockOnCancel = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <DeletionWarningModal
            isOpen={true}
            onCancel={mockOnCancel}
            onConfirm={mockOnConfirm}
          />
        </BrowserRouter>
      </QueryClientProvider>
    );
    expect(await screen.findByTestId("deletion-modal")).toBeVisible();
    await user.click(await screen.findByTestId("cancel-deletion"));
    expect(mockOnCancel).toHaveBeenCalled();
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });
});
