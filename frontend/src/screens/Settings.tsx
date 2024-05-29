/**
 * User settings screen.
 */

import React from "react";

import GoogleSignout from "components/GoogleSignout";
import PortalButton from "components/PortalButton";
import Sidebar from "components/Sidebar";

import "../styles/scrollbar.css";

function Settings(): JSX.Element {
  return (
    <div className="flex h-full overflow-hidden bg-white dark:bg-gray-900">
      <Sidebar />
      <div className="mr-12 ml-72 w-4/5">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white my-8">
          User Settings
        </h1>

        {/* Feedback */}
        <div className="text-gray-900 dark:text-white my-9">
          <h2 className="text-xl font-bold mb-2">Feedback</h2>
          <p className="text-sm">
            We&apos;re grateful to have you as an awesome alpha user! If you
            have any feedback, whether it&apos;s good or bad, please feel free
            to add it to our Feedback Discord Channel or email us at
            asterbasehq@gmail.com.
          </p>
        </div>

        {/* Bug Report */}
        <div className="text-gray-900 dark:text-white my-9">
          <h2 className="text-xl font-bold mb-2">Bug Report</h2>
          <p className="text-sm">
            We strive to provide you with the best app experience possible. If
            you encounter any bugs, glitches, or unexpected behavior while using
            our app, we kindly request that you report them by adding them to
            our Bug Report Discord Channel or by emailing us at
            asterbasehq@gmail.com.
          </p>
        </div>

        {/* Preferences */}
        <div className="text-gray-900 dark:text-white my-9">
          <h2 className="text-xl font-bold mb-2">Preferences</h2>
          <p className="text-sm">
            Sorry to inform you, but Asterspark is currently only in dark mode
            by default. Light mode is not currently available.
          </p>
        </div>

        {/* Billing */}
        <div className="text-gray-900 dark:text-white my-9 flex flex-col gap-2">
          <h2 className="text-xl font-bold">Billing</h2>
          <p className="text-sm mb-1">
            You can manage your billing information and subscription to
            Asterspark here.
          </p>
          <PortalButton />
        </div>

        {/* Danger Zone */}
        <div className="text-gray-900 dark:text-white my-9">
          <h2 className="text-xl font-bold mb-2">Danger Zone</h2>
          <div className="border border-red-600 rounded-sm p-5">
            <h2 className="text-xl font-bold mb-2">Account</h2>
            <p className="text-sm">
              Please email us at asterbasehq@gmail.com if you would like to
              delete your account.
            </p>
          </div>
        </div>

        {/* Logout */}
        <div className="my-9">
          <GoogleSignout />
        </div>
      </div>
    </div>
  );
}

export default Settings;
