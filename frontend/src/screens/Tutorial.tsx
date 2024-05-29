/**
 * Tutorial screen.
 */

import React from "react";

import Sidebar from "components/Sidebar";

import ProjectBlockGraphic from "../img/project_block.png";
import ResourceBlockGraphic from "../img/resource_block.png";
import SkillsGraphic from "../img/skills.png";
import StickyNoteBlockGraphic from "../img/sticky_note_block.png";

import "../styles/scrollbar.css";

function Tutorial(): JSX.Element {
  return (
    <div className="flex h-full overflow-hidden bg-white dark:bg-gray-900">
      <Sidebar />
      <div className="mr-12 ml-72 w-4/5">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white my-8">
          Tutorial
        </h1>

        {/* Workspace */}
        <div className="text-gray-900 dark:text-white my-9">
          <h2 className="text-xl font-bold mb-2">Workspace</h2>
          <p className="text-sm">
            The workspace is where you can organize your learning. It is a
            freely customizable canvas, upon which you can add and position
            blocks. To add a block, click the add new block button at the bottom
            left of the screen. From the resulting dropdown, select the type of
            block you would like to add. It will then be immediately placed on
            the workspace, in the top left corner.
          </p>
          <br />
          <h3>Types of blocks:</h3>
          <ul>
            <li>
              - Project block: The project block allows you to compile a list of
              projects that you have completed or are working on.
              <img src={ProjectBlockGraphic} alt="Project block graphic" />
            </li>
            <li>
              - Resource block: The resource block allows you to compile a list
              of resources for future reference.
              <img src={ResourceBlockGraphic} alt="Resource block graphic" />
            </li>
            <li>
              - Sticky note block: The sticky note block is an open-ended
              textbox within which you can write anything. It can be resized by
              clicking and dragging from the bottom right corner. To delete a
              block, hover over the block and click the button with the three
              dots. Choose delete from the resulting dropdown.
              <img
                src={StickyNoteBlockGraphic}
                alt="Sticky note block graphic"
              />
            </li>
          </ul>
        </div>

        {/* Skills */}
        <div className="text-gray-900 dark:text-white my-9">
          <h2 className="text-xl font-bold mb-2">Skills</h2>
          <img src={SkillsGraphic} alt="Skills graphic" />
          <p className="text-sm">
            The skills section is a place to track and showcase your current
            skillset. We want you to be able to concretely see your growth as
            you learn more and more, and each skill added to your list does just
            that. To add a new skill, start typing in the search bar and select
            your desired option. We apologize if the skill you would like to add
            is not present in our list. If you would like us to add it, please
            email as at asterbasehq@gmail.com or submit a request in the
            #feedback channel on our Discord (
            <a
              href="https://discord.com/invite/r5z6TUjhkH"
              target="_blank"
              rel="noopener noreferrer"
            >
              join here
            </a>
            ). To remove a skill, hover over the skill block and click the
            button with the three dots. Select delete from the dropdown to
            delete the skill from your profile.
          </p>
        </div>

        {/* Gunther AI */}
        <div className="text-gray-900 dark:text-white my-9">
          <h2 className="text-xl font-bold mb-2">Gunther AI</h2>
          <p className="text-sm">
            Gunther AI is our AI Feynman Technique assistant. It walks you
            through a session of the Feynman technique, a proven technique for
            self study. To use Gunther AI, type your responses into the text
            input box at the bottom of the screen. Follow the prompts provided
            by Gunther.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Tutorial;
