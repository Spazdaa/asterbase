import React from "react";

import WorkspacesGraphic from "../img/workspaces_graphic.gif";

function WorkspaceFeatureSection(): JSX.Element {
  return (
    <section className="bg-gray-100 px-6 lg:px-12 py-6 flex flex-col lg:flex-row gap-10 lg:items-center">
      <img
        className="w-full lg:w-3/5 h-auto border-2 border-gray-300 rounded-sm"
        src={WorkspacesGraphic}
        alt="Workspaces for learning anything"
      ></img>
      <div className="lg:w-1/3">
        <h1 className="text-3xl font-semibold mb-4 mt-4">
          Build personalized learning workspaces
        </h1>
        <p>
          Drag and drop blocks onto your workspace to create a centralized
          location for organizing your resources and keeping track of all your
          learning materials. Say goodbye to scattered information and hello to
          streamlined learning.
        </p>
      </div>
    </section>
  );
}

export default WorkspaceFeatureSection;
