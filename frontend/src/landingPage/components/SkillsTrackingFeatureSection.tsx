import React from "react";

import SkillsTrackerGraphic from "../img/skills_tracker_graphic.gif";

function SkillsTrackingFeatureSection(): JSX.Element {
  return (
    <section className="bg-gray-100 px-6 lg:px-12 py-6 flex flex-col lg:flex-row-reverse gap-10 lg:items-center">
      <img
        className="w-full lg:w-3/5 h-auto border-2 border-gray-300 rounded-sm"
        src={SkillsTrackerGraphic}
        alt="Learning skills tracker"
      ></img>
      <div className="lg:w-1/3">
        <h1 className="text-3xl font-semibold mb-4 mt-4">
          Visualize everything you have learned
        </h1>
        <p>
          Progress is one of the most powerful motivators for continuing to
          learn. Track your learning progress over time by adding everything you
          learn to your skills section.
        </p>
      </div>
    </section>
  );
}

export default SkillsTrackingFeatureSection;
