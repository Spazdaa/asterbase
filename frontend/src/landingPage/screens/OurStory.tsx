import React from "react";
import ReactGA from "react-ga4";
import { useNavigate } from "react-router-dom";
import Footer from "landingPage/components/Footer";
import Navbar from "landingPage/components/Navbar";

import AstersparkNotionVersion from "../img/asterspark_notion_version.png";
import AstersparkOverviewImage from "../img/asterspark_overview_image.gif";
import LearningResourcesExample from "../img/learning_resources_examples.png";

function OurStory(): JSX.Element {
  React.useEffect(() => {
    // Used for Google Analytics
    ReactGA.send({
      hitType: "pageview",
      page: "/our-story",
      title: "Our Story Page",
    });
  }, []);

  const navigate = useNavigate();

  return (
    <main className="bg-white">
      <Navbar />
      <div className="w-4/5 lg:w-3/5 flex flex-col mx-auto my-12 gap-7">
        <p>Thanks for your interest in Asterspark!</p>
        <p>
          In this post, we wanted to give you more information behind the
          motivation for Asterspark and why we are building it. For us, these
          reasons are actually quite simple. Both of us are very curious and we
          have a great passion for learning new things. We had a wide variety of
          things we wanted to learn, ranging from coding to design to languages
          and more. But we didn’t have a good system for learning them
          effectively.{" "}
        </p>
        <p>
          As we set out to build this learning system, we were directly inspired
          by the large body of research and books. This included material like
          Deep Work by Cal Newport, Ultralearning by Scott Young, and Building a
          Second Brain by Tiago Forte which all hinted towards what this
          learning system might look like.
        </p>
        <img
          src={LearningResourcesExample}
          alt="Examples of learning resources"
        ></img>
        <p>
          Importantly, we noticed that many tools existed to help you achieve
          goals in other important parts of your life like finances and fitness.
          For example, there are many calorie trackers, workout apps, and
          advanced budgeting tools you can use. However, we did not find as many
          tools to help you achieve your learning goals which we find are just
          as important.
        </p>
        <p>
          Toward the end of our brainstorming, we realized that the techniques
          and systems we were creating could be packaged into one unified
          product and shared with the world. This became the first version of
          Asterspark which we created in Notion.
        </p>
        <img
          src={AstersparkNotionVersion}
          alt="Asterspark built in Notion"
        ></img>
        <p>
          However, as we continued building and adding new features to the first
          version of Asterspark, we quickly outgrew what we could do within our
          limited constraints. As a result, we went back to the drawing board to
          design and build the next version of Asterspark. Which is where we are
          today.
        </p>
        <img src={AstersparkOverviewImage} alt="Overview of Asterspark"></img>
        <p>
          We see learning as one of the greatest superpowers someone can have.
          Having a great process for learning levels up what you know and what
          you can do, which in turn can lead to more opportunities in the
          future. If you’re able to learn new skills effectively, it could mean
          landing a new transformative job, taking your hobby to the next level,
          or increasing your sense of personal fulfillment. We’re confident that
          Asterspark will let you tap into your learning superpowers.
        </p>
        <div>
          <p>Sincerely,</p>
          <p>Andy Nguyen and Shasta Johnsen-Sollos</p>
        </div>
        <button
          onClick={() => {
            navigate("/login");
          }}
          className="bg-green-700 text-white py-2 px-7 rounded-md self-start"
        >
          Get Started
        </button>
      </div>
      <Footer />
    </main>
  );
}

export default OurStory;
