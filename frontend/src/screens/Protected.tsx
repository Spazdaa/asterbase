/**
 * Protected route to screen for authenticated users.
 */

import React from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

function Protected(props: { children: JSX.Element }): JSX.Element {
  const { children } = props;
  // Check if authenticated (i.e. authenticated cookie exists).
  // If not, redirect to login screen.
  if (Cookies.get("authenticated") !== undefined) {
    return <div>{children}</div>;
  } else {
    return <Navigate to="/login" />;
  }
}

export default Protected;
