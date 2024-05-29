import React from "react";

import CodingGraphic from "../img/roadmap_graphic_coding1.png";
import DesignGraphic from "../img/roadmap_graphic_design3.png";
import JapaneseGraphic from "../img/roadmap_graphic_japanese4.png";
import MLAIGraphic from "../img/roadmap_graphic_mlai2.png";

type CarouselValues = Record<string, string>;

function RoadmapsFeatureSection(): JSX.Element {
  let intervalId: NodeJS.Timeout;
  const [currentEntry, setCurrentEntry] = React.useState("1");
  const carouselValues: CarouselValues = {
    "1": CodingGraphic,
    "2": MLAIGraphic,
    "3": DesignGraphic,
    "4": JapaneseGraphic,
  };
  const currentImage = carouselValues[currentEntry];

  React.useEffect(() => {
    intervalId = setInterval(() => {
      setCurrentEntry((currentEntry) => {
        const parsedEntry = parseInt(currentEntry);
        return String((parsedEntry % 4) + 1);
      });
    }, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <section className="bg-gray-100 px-6 lg:px-12 py-6 flex flex-col lg:flex-row-reverse gap-10 lg:items-center">
      <div className="w-full lg:w-3/5 h-auto">
        <img src={currentImage} alt="Roadmap for learning coding"></img>
        <div className="flex gap-4 justify-center mt-4">
          <button
            className="shadow-md bg-green-700 text-white px-4 py-1 rounded-md font-semibold"
            onClick={() => {
              setCurrentEntry("1");
            }}
          >
            Coding
          </button>
          <button
            className="shadow-md bg-blue-800 text-white px-4 py-1 rounded-md font-semibold"
            onClick={() => {
              setCurrentEntry("2");
            }}
          >
            Machine Learning and AI
          </button>
          <button
            className="shadow-md bg-purple-800 text-white px-4 py-1 rounded-md font-semibold"
            onClick={() => {
              setCurrentEntry("3");
            }}
          >
            Design
          </button>
          <button
            className="shadow-md bg-red-700 text-white px-4 py-1 font-semibold rounded-md"
            onClick={() => {
              setCurrentEntry("4");
            }}
          >
            Japanese
          </button>
        </div>
      </div>
      <div className="lg:w-1/3">
        <h1 className="text-3xl font-semibold mb-4 mt-4">
          Start with a learning roadmap
        </h1>
        <p>
          Choose from our community-made roadmaps which provide resources,
          progression, and tips. Gain a high-level overview for any topic you
          are learning and understand exactly what you have to do to learn
          something new.
        </p>
      </div>
    </section>
  );
}

export default RoadmapsFeatureSection;
