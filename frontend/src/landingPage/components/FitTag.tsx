import type { ReactNode } from "react";
import React from "react";

interface FitTagProps {
  children: ReactNode;
}

function FitTag({ children }: FitTagProps): JSX.Element {
  return (
    <div className="bg-gray-200 flex gap-2 items-center px-3 py-1 text-md rounded-full">
      {children}
    </div>
  );
}

export default FitTag;
