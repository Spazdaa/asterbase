/**
 * Button that creates a Stripe portal session.
 */

import React from "react";
import { useMutation } from "@tanstack/react-query";

import api from "api";

function PortalButton(): JSX.Element {
  const portal = useMutation({
    mutationFn: async () => {
      const response = await api.post("/billing/portal", {
        returnUrl: `${window.location.protocol}//${window.location.host}/settings`,
      });
      window.location.href = response.data.url;
    },
  });

  return (
    <div>
      <button
        className="px-4 py-2 rounded-md text-blue-900 bg-white border border-blue-300 hover:bg-blue-100 focus:ring-4 focus:ring-blue-300 disabled:hover:bg-white dark:bg-blue-600 dark:text-white dark:border-blue-600 dark:hover:bg-blue-700 dark:hover:border-blue-700 dark:focus:ring-blue-700"
        onClick={() => {
          portal.mutate();
        }}
      >
        Manage Subscription
      </button>
    </div>
  );
}

export default PortalButton;
