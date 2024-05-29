/**
 * Error screen if the user tries to access a page that does not exist.
 */

import React from "react";

import Sidebar from "components/Sidebar";

import "../styles/scrollbar.css";

function Error(): JSX.Element {
  return (
    <div className="flex overflow-hidden bg-white dark:bg-gray-900">
      <Sidebar />
      <h2 className="mr-12 ml-72 w-4/5 mt-12 dark:text-white">
        Page Does Not Exist
      </h2>
    </div>
  );
}

export default Error;
