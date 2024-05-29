/** Google sign in button using the new Sign In with Google feature:
 * https://developers.google.com/identity/gsi/web/guides/overview
 *
 * React adaptation based on:
 * https://dev.to/mremanuel/add-the-new-google-sign-in-to-your-react-app-p6m
 */
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Checkbox, Label, Modal } from "flowbite-react";
import Cookies from "js-cookie";

import api from "api";
import googleButton from "img/google_button.png";

export default function GoogleSignin(): JSX.Element {
  const navigate = useNavigate();
  const [acceptance, setAcceptance] = React.useState(false);

  const checkAccount = useMutation({
    mutationFn: async () => {
      return (await api.get("/auth/user")).data;
    },
    onSuccess: (data) => {
      if (data !== "") {
        setAcceptance(true);
      }
    },
  });

  // Check if the account is already created.
  React.useEffect(() => {
    checkAccount.mutate();
  }, []);

  const login = useMutation({
    mutationFn: async (token: string) => {
      if (!acceptance) return;

      const response = await api.post("/auth/login", { credential: token });
      // Set authenticated cookie. This is just for the frontend, it does not give access to
      // server information.
      Cookies.set("authenticated", "true");
      if (response.data.subscriptionStatus === "active") {
        // Redirect to workspace after logging in.
        const getResponse = await api.get("/workspaces");
        if (getResponse.data.length > 0) {
          // For now, users only have one workspace.
          navigate(`/workspaces/${getResponse.data[0]._id as string}`);
        }
      } else {
        // Request payment.
        navigate("/subscribe");
      }
    },
  });

  const [gsiScriptLoaded, setGsiScriptLoaded] = React.useState(false);

  React.useEffect(() => {
    if (gsiScriptLoaded) return;

    const initializeGsi = (): void => {
      if (
        window.google == null ||
        gsiScriptLoaded ||
        process.env.VITE_GOOGLE_CLIENT_ID == null
      )
        return;

      setGsiScriptLoaded(true);
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: process.env.VITE_GOOGLE_CLIENT_ID,
        scope: `https://www.googleapis.com/auth/user.birthday.read https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile`,
        callback: (response: any) => {
          login.mutate(response.access_token);
        },
      });

      const element = document.getElementById("google_signin");
      if (element == null) return;
      element.onclick = () => {
        client.requestAccessToken();
      };
    };

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.onload = initializeGsi;
    script.async = true;
    script.defer = true;
    script.id = "google-client-script";
    document.querySelector("body")?.appendChild(script);

    return () => {
      // Cleanup function that runs when component unmounts.
      document.getElementById("google-client-script")?.remove();
    };
  });

  return (
    <div>
      <button>
        <img src={googleButton} id="google_signin" />
      </button>
      <Modal show={!acceptance}>
        <div className="p-4 text-white">
          Please accept the terms of service and privacy policy before signing
          in / creating an account.
          <br />
          <br />
          <Label htmlFor="accept" className="mr-2">
            Accept
          </Label>
          <Checkbox
            id="accept"
            onChange={() => {
              setAcceptance(true);
            }}
            theme={{
              root: {
                base: "h-4 w-4 rounded focus:ring-2 border border-white dark:border-white dark:bg-gray-700 bg-gray-100",
              },
            }}
          />
          <div className="flex text-sm text-gray-300">
            <p>
              By clicking accept, you agree, represent and warrant that you have
              read and fully understand the{" "}
              <Link to="/terms" className="underline">
                Terms and Conditions of Use
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="underline">
                Privacy Policy
              </Link>{" "}
              and agree to be bound by them. You represent and warrant that you
              are the age of majority in your province, state, territory or
              country as the case may be.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
