import React from "react";
import ReactGA from "react-ga4";
import { useNavigate } from "react-router-dom";

import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

function About(): JSX.Element {
  const navigate = useNavigate();

  React.useEffect(() => {
    // Used for Google Analytics
    ReactGA.send({ hitType: "pageview", page: "/about", title: "About Page" });
  }, []);

  return (
    <main className="bg-white">
      <Navbar />
      <div className="w-4/5 lg:w-3/5 flex flex-col mx-auto my-12 gap-7">
        <h1 className="text-2xl font-bold">What is Asterspark?</h1>
        <p>
          Asterspark is an all-in-one tool that you can use to learn tech
          skills. We’ve noticed that many people want to learn about different
          areas in tech like web development, data science, game development, or
          machine learning and AI. But very few people successfully follow
          through and achieve these learning goals. This is where Asterspark
          comes in.
        </p>
        <p>
          To help more people follow through and achieve their learning goals,
          we’ve looked at the entire learning process from start, middle, to
          finish to identify the hardest parts about learning for each of these
          phases and build solutions for them into Asterspark. We want
          Asterspark to guide learners through every stage of the learning
          process.
        </p>
        <h1 className="text-2xl font-bold">
          What are Some of Asterspark’s Features?
        </h1>
        <p>
          Asterspark’s features are centered around the different stages of the
          learning process.
        </p>
        <p>
          🏁 At the start of the learning process, a very common problem is not
          knowing what you have to do to achieve your learning goal. With
          Asterspark, you can use an AI-powered assistant which will provide
          step-by-step guidance and resources to learn a variety of topics.
        </p>
        <p>
          🚀A feeling of progress is one of the most powerful motivators for
          continuing to do hard things. Learning is no exception to this but it
          is generally more difficult to easily see your learning progress and
          improvement. With Asterspark, you can visualize everything that you
          have learned and quantify your progress overtime.
        </p>
        <p>
          🤝 We also know that learning with friends and other people makes the
          experience more effective and enjoyable. Some features we plan to
          include to facilitate collaborative learning include accountability
          check-ins, activity sharing, and multiplayer within workspaces.
        </p>
        <p>
          🏆 For the end of the learning process, we want to make it easy to
          translate what you learn into job opportunities. We plan to match
          learners with compatible jobs and help you craft a profile that will
          make you stand out from other candidates.
        </p>
        <h1 className="text-2xl font-bold">Who is Asterspark for?</h1>
        <ul>
          <li>
            ✅ Working professionals who often learn new things for their work
            or personal development (E.g. Software developers, Engineers,
            Designers, Scientists, etc.)
          </li>
          <li>✅ Self-taught learners</li>
          <li>✅ Hobbyists who want to pick up new skills</li>
          <li>✅ People learning new skills to make a career switch</li>
        </ul>
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

export default About;
