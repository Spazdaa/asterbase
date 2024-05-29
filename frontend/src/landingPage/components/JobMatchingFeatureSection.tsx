import React from "react";

import LinkedinForLearningGraphic from "../img/linkedin_for_learning_graphic.png";

function JobMatchingFeatureSection(): JSX.Element {
  return (
    <section className="bg-gray-100 px-6 lg:px-12 py-6 flex flex-col lg:flex-row gap-10 lg:items-center">
      <img
        className="w-full lg:w-3/5 h-auto"
        src={LinkedinForLearningGraphic}
        alt="Roadmap for learning coding"
      ></img>
      <div className="lg:w-1/3">
        <h1 className="text-3xl font-semibold mb-4 mt-4">
          Asterspark is the Linkedin for learning
        </h1>
        <p>
          Share your learning progress and develop skills that get noticed by
          employers.{" "}
        </p>
      </div>
    </section>
  );
}

export default JobMatchingFeatureSection;
