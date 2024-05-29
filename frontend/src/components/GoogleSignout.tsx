/** Google sign out button using the new Sign In with Google feature:
 * https://developers.google.com/identity/gsi/web/guides/overview
 */
import React from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";

import api from "api";

export default function GoogleSignout(): JSX.Element {
  const navigate = useNavigate();

  const logout = useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout");
      // Remove authenticated cookie so frontend knows user is not logged in.
      Cookies.remove("authenticated");
      // Redirect to login screen after logging out.
      navigate("/login");
    },
  });

  return (
    <button
      className="px-4 py-2 rounded-md text-blue-900 bg-white border border-blue-300 hover:bg-blue-100 focus:ring-4 focus:ring-blue-300 disabled:hover:bg-white dark:bg-blue-600 dark:text-white dark:border-blue-600 dark:hover:bg-blue-700 dark:hover:border-blue-700 dark:focus:ring-blue-700"
      onClick={() => {
        logout.mutate();
      }}
    >
      Logout
    </button>
  );
}
