/** Error banner component that stays on screen for long running errors. */

import React from "react";
import { create } from "zustand";

interface State {
  error: string | null;
  setError: (error: string | null) => void;
}

export const useStore = create<State>((set) => ({
  error: null,
  setError: (error) => {
    set(() => ({ error }));
  },
}));

function ErrorBanner(): JSX.Element {
  const error = useStore((state) => state.error);

  return (
    <div>
      {error != null && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center z-50">
          <p className="text-sm font-semibold">Error{error}</p>
        </div>
      )}
    </div>
  );
}

export default ErrorBanner;
