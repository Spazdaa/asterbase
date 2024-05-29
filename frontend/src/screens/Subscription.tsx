/**
 * Subscription screen where user can purchase a subscription.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "flowbite-react";

import AlphaTag from "components/AlphaTag";
import CheckoutButton from "components/CheckoutButton";
import logo from "img/logo_large_transparent.png";

function Subscription(): JSX.Element {
  const navigate = useNavigate();

  return (
    <div>
      <header
        onClick={() => {
          navigate("/");
        }}
        className="flex items-center absolute hover:cursor-pointer"
      >
        <img src={logo} alt="logo" className="my-8 ml-8 mr-4 w-8" />
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold text-gray-900 my-12 mr-2">
            Asterspark
          </h1>
          <div className="flex-start">
            <AlphaTag />
          </div>
        </div>
      </header>
      <div className="flex min-h-screen bg-white items-center justify-center">
        <Card
          className="px-10 py-10 mt-10 w-[800px]"
          theme={{
            root: {
              base: "flex rounded-lg border border-gray-200 bg-white shadow-md",
            },
          }}
        >
          <div className="flex flex-col">
            <h5 className="text-2xl font-bold text-gray-900 mb-7">
              Thanks for creating an account and for your interest in
              Asterspark!
            </h5>
            <p className="mb-10">
              To gain access to the app, please proceed to the secure checkout
              page to
              <br />
              purchase a subscription to Asterspark.
              <br />
              <br />
              We hope Asterspark will be the beginning of your fruitful learning
              journey!
            </p>
            <div>
              <CheckoutButton />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Subscription;
