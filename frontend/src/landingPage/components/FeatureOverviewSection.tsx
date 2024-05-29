import React from "react";
import { HiMap, HiSquares2X2 } from "react-icons/hi2";
import { MdOutlineWork, MdPeople, MdTimeline } from "react-icons/md";

function FeatureOverviewSection(): JSX.Element {
  return (
    <section className="lg:px-16 lg:py-12 px-6 py-6 bg-green-800 flex flex-col lg:flex-row lg:gap-14 mt-8">
      <div className="lg:w-2/5">
        <h1 className="text-white text-3xl mb-3">
          Everything you need for learning in one tool.
        </h1>
        <h2 className="text-white text-1xl">
          {"Learning is hard but it doesn’t have to be."}
        </h2>
      </div>

      <div className="flex flex-col gap-8 mt-12 lg:mt-0 lg:gap-12 lg:w-3/5 lg:grid lg:grid-cols-2 lg:grid-row-3 lg:items-start">
        <div>
          <div className="flex gap-3 items-center mb-2">
            <div className="bg-green-200 w-7 h-7 rounded-md flex justify-center items-center">
              <HiMap size={20} />
            </div>
            <h1 className="text-white text-1xl font-bold">
              AI-Powered Learning
            </h1>
          </div>
          <p className="text-white text-1xl">
            Personalized step-by-step guidance for learning anything.
          </p>
        </div>
        <div>
          <div className="flex gap-3 items-center mb-2">
            <div className="bg-green-200 w-7 h-7 rounded-md flex justify-center items-center">
              <MdTimeline size={20} />
            </div>
            <h1 className="text-white text-1xl font-bold">Skills Tracker</h1>
          </div>
          <p className="text-white text-1xl">
            Keep track of your learning progress.
          </p>
        </div>
        <div>
          <div className="flex gap-3 items-center mb-2">
            <div className="bg-green-200 w-7 h-7 rounded-md flex justify-center items-center">
              <HiSquares2X2 size={20} />
            </div>
            <h1 className="text-white text-1xl font-bold">Workspaces</h1>
          </div>
          <p className="text-white text-1xl">
            Create organized workspaces for all your learning materials.
          </p>
        </div>
        <div>
          <div className="flex gap-3 items-center mb-2">
            <div className="bg-green-200 w-7 h-7 rounded-md flex justify-center items-center">
              <MdOutlineWork size={20} />
            </div>
            <h1 className="text-white text-1xl font-bold">Job Matching</h1>
          </div>
          <p className="text-white text-1xl">
            Find jobs that suit your skill set.
          </p>
        </div>
        <div>
          <div className="flex gap-3 items-center mb-2">
            <div className="bg-green-200 w-7 h-7 rounded-md flex justify-center items-center">
              <MdPeople size={20} />
            </div>
            <h1 className="text-white text-1xl font-bold">
              Collaborative Learning
            </h1>
          </div>
          <p className="text-white text-1xl">
            Learn and stay accountable with friends.
          </p>
        </div>
      </div>
    </section>
  );
}

export default FeatureOverviewSection;
