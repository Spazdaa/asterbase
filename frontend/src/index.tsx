import React from "react";
import ReactDOM from "react-dom/client";
import ReactGA from "react-ga4";
import { Toaster } from "react-hot-toast";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LandingPage from "landingPage/screens/LandingPage";
import Pricing from "landingPage/screens/Pricing";

import ErrorBanner from "components/ErrorBanner";
import Error from "screens/Error";
import Gunther from "screens/Gunther";
import Login from "screens/Login";
import PrivacyPolicy from "screens/PrivacyPolicy";
import Protected from "screens/Protected";
import Settings from "screens/Settings";
import Skills from "screens/Skills";
import Subscription from "screens/Subscription";
import TermsOfService from "screens/TermsOfService";
import Tutorial from "screens/Tutorial";
import Workspace from "screens/Workspace";

import About from "./landingPage/screens/About";
import OurStory from "./landingPage/screens/OurStory";
import reportWebVitals from "./reportWebVitals";

import "./index.css";

// Initalizes Google Analytics for use throughout the app
ReactGA.initialize(process.env.VITE_GOOGLE_ANALYTICS_TAG as string);
const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
    errorElement: <Error />,
  },
  {
    path: "/login",
    element: <Login />,
    errorElement: <Error />,
  },
  {
    path: "/about",
    element: <About />,
    errorElement: <Error />,
  },
  {
    path: "/our-story",
    element: <OurStory />,
    errorElement: <Error />,
  },
  {
    path: "/pricing",
    element: <Pricing />,
    errorElement: <Error />,
  },
  {
    path: "/terms",
    element: <TermsOfService />,
    errorElement: <Error />,
  },
  {
    path: "/privacy",
    element: <PrivacyPolicy />,
    errorElement: <Error />,
  },
  {
    path: "/subscribe",
    element: (
      <Protected>
        <Subscription />
      </Protected>
    ),
    errorElement: <Error />,
  },
  {
    path: "/workspaces/:workspaceId",
    element: (
      <Protected>
        <Workspace />
      </Protected>
    ),
    errorElement: <Error />,
  },
  {
    path: "/skills",
    element: (
      <Protected>
        <Skills />
      </Protected>
    ),
    errorElement: <Error />,
  },
  {
    path: "/gunther",
    element: (
      <Protected>
        <Gunther />
      </Protected>
    ),
    errorElement: <Error />,
  },
  {
    path: "/tutorial",
    element: (
      <Protected>
        <Tutorial />
      </Protected>
    ),
    errorElement: <Error />,
  },
  {
    path: "/settings",
    element: (
      <Protected>
        <Settings />
      </Protected>
    ),
    errorElement: <Error />,
  },
  {
    path: "/error",
    element: <Error />,
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
// Set background globally.
document.body.classList.add("bg-background");
// Enable dark mode.
document.body.classList.add("dark");
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* Set to dark mode by default */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        }}
      />
      <ErrorBanner />
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
