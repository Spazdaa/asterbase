import React from "react";
import { AiFillCode, AiFillRobot, AiOutlineLineChart } from "react-icons/ai";
import { BsServer } from "react-icons/bs";
import { HiLightBulb } from "react-icons/hi2";
import {
  MdAssessment,
  MdBook,
  MdBuildCircle,
  MdOutlineDesignServices,
  MdSecurity,
  MdSportsEsports,
  MdWeb,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";

import FitTag from "./FitTag";

function CallToActionSection(): JSX.Element {
  const navigate = useNavigate();

  return (
    <section>
      <div className="w-full h-6 bg-green-600"></div>
      <section className="px-6 py-4">
        <h1 className="text-center text-2xl lg:text-3xl font-bold mb-4">
          Let Asterspark Help You Achieve your Learning Goals 🏆
        </h1>
        <div className="flex justify-center">
          <button
            onClick={() => {
              navigate("/login");
            }}
            className="bg-green-700 text-white py-2 px-7 rounded-md self-start"
          >
            Get Started
          </button>
        </div>
        {/* Hides who Asterspark is for on mobile */}
        <div className="hidden lg:block">
          <h1 className="text-xl text-center mt-12 mb-3">
            Asterspark is made with 💚 for
          </h1>
          <div className="flex gap-3 text-sm justify-center mb-3">
            <FitTag>
              <MdOutlineDesignServices />
              Designers
            </FitTag>
            <FitTag>
              <AiFillCode />
              Software Developers
            </FitTag>
            <FitTag>
              <AiOutlineLineChart />
              Data Scientists
            </FitTag>
            <FitTag>
              <AiFillRobot />
              ML Engineers
            </FitTag>
          </div>
          <div className="flex gap-3 text-sm justify-center mb-3">
            <FitTag>
              <MdWeb />
              Front-End Engineers
            </FitTag>
            <FitTag>
              <MdBook />
              Self-Taught Learners
            </FitTag>
            <FitTag>
              <HiLightBulb />
              Life-Long Learners
            </FitTag>
            <FitTag>
              <BsServer />
              Back-End Engineers
            </FitTag>
          </div>
          <div className="flex gap-3 text-sm justify-center mb-3">
            <FitTag>
              <MdAssessment />
              Data Analysts
            </FitTag>
            <FitTag>
              <MdSecurity />
              Cybersecurity Analysts
            </FitTag>
            <FitTag>
              <MdSportsEsports />
              Game Developers
            </FitTag>
            <FitTag>
              <MdBuildCircle />
              DevOps Engineers
            </FitTag>
          </div>
        </div>
      </section>
      <div className="w-full h-6 bg-green-600"></div>
    </section>
  );
}

export default CallToActionSection;
