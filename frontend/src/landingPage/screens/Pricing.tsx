/* eslint-disable react/no-unescaped-entities */
import React from "react";
import ReactGA from "react-ga4";
import { FiCoffee } from "react-icons/fi";
import { GrFormCheckmark } from "react-icons/gr";
import { HiSparkles } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import Footer from "landingPage/components/Footer";
import Navbar from "landingPage/components/Navbar";

function Pricing(): JSX.Element {
  const navigate = useNavigate();

  React.useEffect(() => {
    // Used for Google Analytics
    ReactGA.send({
      hitType: "pageview",
      page: "/pricing",
      title: "Pricing Page",
    });
  }, []);

  return (
    <main className="bg-white flex flex-col h-screen">
      <Navbar />
      {/* Header */}
      <div className="flex flex-col items-center">
        <div className="border-2 border-black rounded-full w-12 h-12 flex justify-center items-center px-2 py-2">
          <FiCoffee size={32} />
        </div>

        <h1 className="mt-6 text-center text-xl font-semibold mb-3 lg:text-3xl">
          At the cost of a coffee per month.
        </h1>
        <p className=" text-center mx-auto text-sm text-gray-600 mb-8 md:w-80 w-72 lg:w-[400px]">
          If you're interested in supporting the indie development of
          Asterspark, consider getting a subscription. We'd really appreciate
          your support!
        </p>
      </div>

      <div className="bg-white flex-grow">
        {/* Pricing Card */}
        <div className="bg-white border border-gray-200 shadow-md rounded-sm p-6 w-80 mx-auto md:w-[400px] lg:w-[470px] mb-12">
          <div className="flex items-center gap-1 mb-12">
            <HiSparkles className="text-yellow-400" size={18} />
            <h1 className="text-lg font-semibold">Standard</h1>
          </div>
          <h2 className="mb-2">
            <span className="text-4xl">$3.50</span>{" "}
            <span className="text-sm text-gray-400">/ month</span>
          </h2>
          <button
            onClick={() => {
              navigate("/login");
            }}
            className="bg-green-700 text-white text-sm py-2 mb-6 px-5 rounded-md self-start w-full"
          >
            Get Started
          </button>
          <h3 className="text-xs font-semibold">Includes:</h3>
          <ul className="text-xs flex flex-col gap-3">
            <li className="flex items-center gap-1 mt-3">
              <GrFormCheckmark size={16} />
              Private learning workspaces
            </li>
            <li className="flex items-center gap-1">
              <GrFormCheckmark size={16} />
              Robust tech skills tracker
            </li>
            <li className="flex items-center gap-1">
              <GrFormCheckmark size={16} />
              AI-Powered Learning Tools
            </li>
            <li className="flex items-center gap-1">
              <GrFormCheckmark size={16} />
              One-on-one support with the Founders
            </li>
          </ul>
        </div>
      </div>
      <Footer />
    </main>
  );
}

export default Pricing;
