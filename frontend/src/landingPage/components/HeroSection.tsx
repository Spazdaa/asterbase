import React from "react";
import { useNavigate } from "react-router-dom";

import GenericWorkspaceOverviewImg from "../img/generic_workspace_overview.png";
import HeaderTestimonalImage from "../img/kim_testimonial_image.jpg";

function HeroSection(): JSX.Element {
  const learningOptions: string[] = [
    "programming languages",
    "web development",
    "data science",
    "app development",
    "machine learning and AI",
    "game development",
  ];
  const learningOptionsColours: string[] = [
    "text-blue-600",
    "text-green-600",
    "text-purple-600",
    "text-blue-500",
    "text-pink-600",
    "text-fuchsia-600",
  ];
  const [idx, setIdx] = React.useState(0);
  const [currentOption, setCurrentOption] = React.useState(learningOptions[0]);
  const [currentColour, setCurrentColour] = React.useState(
    learningOptionsColours[0]
  );
  let intervalId: NodeJS.Timeout;

  const navigate = useNavigate();

  React.useEffect(() => {
    intervalId = setInterval(() => {
      setIdx((prevIdx) => (prevIdx + 1) % learningOptions.length);
    }, 2000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  React.useEffect(() => {
    setCurrentOption(learningOptions[idx]);
    setCurrentColour(learningOptionsColours[idx]);
  }, [idx]);

  return (
    <section className="px-6 lg:px-16 lg:flex lg:items-center lg:gap-8 lg:overflow-hidden">
      <div className="flex flex-col gap-5 flex-none lg:w-2/6">
        <div>
          <h1 className="text-4xl font-bold mb-5">
            All-in-one tool for learning tech skills
          </h1>
          <div className="text-lg">
            <h2>Achieve your learning goals. Asterspark</h2>
            <h2>
              can help you learn{" "}
              <span className={currentColour}>{currentOption}</span>
            </h2>
            <h2>and more 🏆.</h2>
          </div>
        </div>
        <button
          onClick={() => {
            navigate("/login");
          }}
          className="bg-green-700 text-white py-2 px-7 rounded-md self-start"
        >
          Get Started
        </button>
        <hr className="border-2 w-20"></hr>
        <div>
          <h2 className="text-xl text-gray-500">
            {'"The Notion for learning tech skills"'}
          </h2>
          <div className="flex gap-3 items-center">
            <img
              src={HeaderTestimonalImage}
              alt="Testimonal image for Asterspark"
              className="object-cover bg-gray-400 w-12 h-12 rounded-full"
            ></img>
            <h3 className="text-md font-semibold text-gray-500">Kim Wang</h3>
          </div>
        </div>
      </div>
      <img
        className="lg:w-5/6 rounded-md border-2 border-gray-200 w-full h-auto mt-6"
        src={GenericWorkspaceOverviewImg}
        alt="Overview image of Asterspark"
      ></img>
    </section>
  );
}

export default HeroSection;
