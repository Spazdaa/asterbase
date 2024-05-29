/**
 * Button that creates a Stripe checkout session.
 */

import React from "react";
import { MdLock } from "react-icons/md";
import { useMutation } from "@tanstack/react-query";
import { Button } from "flowbite-react";

import api from "api";

function CheckoutButton(): JSX.Element {
  const checkout = useMutation({
    mutationFn: async () => {
      const response = await api.post("/billing/checkout", {
        priceId: process.env.VITE_STRIPE_PRICE_ID,
        successUrl: `${window.location.protocol}//${window.location.host}/login`,
        cancelUrl: `${window.location.protocol}//${window.location.host}/subscribe`,
      });
      window.location.href = response.data.url;
    },
  });

  return (
    <div>
      <Button
        color="green"
        onClick={() => {
          checkout.mutate();
        }}
        className="px-6 py-2"
        size="xs"
      >
        <MdLock className="mr-2 w-5 h-5" />
        <h3 className="text-lg font-semibold">Checkout</h3>
      </Button>
    </div>
  );
}

export default CheckoutButton;
