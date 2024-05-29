/** Unit tests for the protected screen component. */

import * as React from "react";
import { BrowserRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import Cookies from "js-cookie";

import Protected from "./Protected";

describe("Protected screen component", () => {
  it("displays children if authenticated", async () => {
    // Requires it to be wrapped in a browser router so navigate can be used.
    Cookies.set("authenticated", "true");
    render(
      <BrowserRouter>
        <Protected>
          <div>Protected test</div>
        </Protected>
      </BrowserRouter>
    );
    expect(await screen.findByText("Protected test")).toBeInTheDocument();
    Cookies.remove("authenticated");
  });

  it("does not display children if not authenticated", () => {
    // Requires it to be wrapped in a browser router so navigate can be used.
    render(
      <BrowserRouter>
        <Protected>
          <div>Protected test</div>
        </Protected>
      </BrowserRouter>
    );
    expect(screen.queryByText("Protected test")).not.toBeInTheDocument();
  });
});
