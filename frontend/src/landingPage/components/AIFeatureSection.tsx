import React from "react";

import AIGraphic from "../img/ai_graphic.gif";

function AIFeatureSection(): JSX.Element {
  return (
    <section className="bg-gray-100 px-6 lg:px-12 lg:pb-4 lg:pt-16 flex flex-col lg:flex-row-reverse gap-5 lg:items-center">
      <div className="w-full lg:w-3/5 h-auto">
        <img
          className="w-[650px] h-auto border-2 border-gray-300 shadow-sm lg:ml-20"
          src={AIGraphic}
          alt="Roadmap for learning coding"
        ></img>
        <div className="flex gap-4 justify-center mt-4"></div>
      </div>
      <div className="lg:w-1/3">
        <h1 className="text-3xl font-semibold mb-4 mt-4">
          Personalized Learning Powered by AI
        </h1>
        <p>
          Unlock personalized learning experiences with our AI chatbot that
          provides guidance when learning something new.
        </p>
      </div>
    </section>
  );
}

export default AIFeatureSection;
