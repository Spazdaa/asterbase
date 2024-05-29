/**
 * Login page for the application.
 */

import React, { useEffect, useState } from "react";
import ReactGA from "react-ga4";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Spinner } from "flowbite-react";
import Cookies from "js-cookie";

import api from "api";
import AlphaTag from "components/AlphaTag";
import GoogleSignin from "components/GoogleSignin";
import logo from "img/logo_large_transparent.png";

import { ReactComponent as LearningSketch } from "../img/learning_sketch.svg";

function Login(): JSX.Element {
  const navigate = useNavigate();
  const [displayLogin, setDisplayLogin] = useState(false);

  useEffect(() => {
    // Used for Google Analytics
    ReactGA.send({
      hitType: "pageview",
      page: "/login",
      title: "Login Page",
    });
    setDisplayLogin(Cookies.get("authenticated") !== "true");
  }, []);

  // Skip the login page if the session is still valid.
  const verifyLogin = useMutation({
    mutationFn: async () => {
      return (await api.post("/auth/verify")).data;
    },
    onSuccess: async (data: any) => {
      Cookies.set("authenticated", "true");

      if (data.subscriptionStatus === "active") {
        // Redirect to workspace.
        const workspaces = await api.get("/workspaces");
        if (workspaces.data.length > 0) {
          // For now, users only have one workspace.
          navigate(`/workspaces/${workspaces.data[0]._id as string}`);
        } else {
          navigate("/settings");
        }
      } else if (data.subscriptionStatus === "inactive") {
        // Request payment.
        navigate("/subscribe");
      }
    },
    onError: async () => {
      setDisplayLogin(true);
    },
  });

  useEffect(() => {
    verifyLogin.mutate();
  }, []);

  function handleClick(): void {
    navigate("/");
  }

  return (
    <div>
      {displayLogin ? (
        <div className="h-screen w-full bg-white flex">
          {/* Left half */}
          <div className="w-1/2 flex items-center justify-center">
            {/* Top left logo */}
            <div
              onClick={handleClick}
              className="flex items-center absolute top-7 left-7 hover:cursor-pointer"
            >
              <img src={logo} alt="logo" className="mr-2 w-8" />
              <div className="flex items-center">
                <h1 className="text-2xl font-semibold text-black mr-2">
                  Asterspark
                </h1>
                <div className="flex-start">
                  <AlphaTag />
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center w-1/2 h-full items-center">
              <h1 className="text-3xl font-semibold">Welcome 👋!</h1>
              <p className="text-md text-gray-500 mb-4">
                Sign in or Create an Account with Google
              </p>
              <GoogleSignin />
            </div>
          </div>
          {/* Right half */}
          <div className="bg-green-700 w-1/2 flex flex-col justify-center items-center">
            <LearningSketch className="w-1/2 h-auto mb-4" />
            <h1 className="text-white font-medium text-2xl">
              Start learning with Asterspark today
            </h1>
            <h2 className="text-white font-light text-lg">
              The Notion for learning tech skills
            </h2>
          </div>
        </div>
      ) : (
        <div className="flex h-screen justify-center items-center">
          <Spinner
            aria-label="Loading..."
            size="xl"
            theme={{ size: { xl: "w-32 h-32" } }}
          />
        </div>
      )}
    </div>
  );
}

export default Login;
