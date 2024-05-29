import React from "react";
import ReactGA from "react-ga4";
import AIFeatureSection from "landingPage/components/AIFeatureSection";
import CallToActionSection from "landingPage/components/CallToActionSection";
import FeatureOverviewSection from "landingPage/components/FeatureOverviewSection";
import Footer from "landingPage/components/Footer";
import HeroSection from "landingPage/components/HeroSection";
import JobMatchingFeatureSection from "landingPage/components/JobMatchingFeatureSection";
import Navbar from "landingPage/components/Navbar";
import SkillsTrackingFeatureSection from "landingPage/components/SkillsTrackingFeatureSection";
import WorkspaceFeatureSection from "landingPage/components/WorkspaceFeatureSection";

import OverviewVideoRecording from "../videos/overview_video_recording_asterspark.mp4";

function LandingPage(): JSX.Element {
  React.useEffect(() => {
    // Used for Google Analytics
    ReactGA.send({ hitType: "pageview", page: "/", title: "Landing Page" });
  }, []);

  return (
    <div className="bg-white">
      <Navbar />
      {/* Page Hero Section */}
      <HeroSection />

      {/* Overview of features section */}
      <FeatureOverviewSection />

      {/* Feature 1 - Roadmaps */}
      <AIFeatureSection />

      {/* Feature 2 - Workspaces */}
      <WorkspaceFeatureSection />

      {/* Feature 3 - Skills Tracking */}
      <SkillsTrackingFeatureSection />

      {/* Feature 4 - Jobs Matching */}
      <JobMatchingFeatureSection />
      <CallToActionSection />

      {/* Video */}
      <section className="px-6 py-4 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-center mb-4">
          See Asterspark in Action Below
        </h1>
        <video width="1000" height="auto" controls>
          <source src={OverviewVideoRecording} type="video/mp4" />
        </video>
      </section>
      <Footer />
    </div>
  );
}

export default LandingPage;
