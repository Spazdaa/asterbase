/** Unit tests for the Draggable wrapper component. */

import * as React from "react";
import { DndContext } from "@dnd-kit/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";

import Draggable from "./Draggable";

describe("Draggable component", () => {
  it("displays draggable children", async () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <DndContext>
          <Draggable x={0} y={0} blockId="blockId">
            {(listeners) => <div>Child element</div>}
          </Draggable>
        </DndContext>
      </QueryClientProvider>
    );

    expect(await screen.findByText("Child element")).toBeInTheDocument();
  });
});
