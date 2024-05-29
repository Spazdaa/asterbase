/** Project card displaying project details. */

import React, { forwardRef } from "react";
import { Button } from "flowbite-react";

const ProjectItem = forwardRef<
  HTMLDivElement,
  {
    style: any;
    onClick: () => void;
    project: Project | undefined;
    images: Record<string, string | undefined>;
  }
>(({ onClick, project, images, ...props }, ref) => {
  return (
    <div {...props} ref={ref}>
      <div className="my-2 mx-px">
        <Button
          onClick={onClick}
          color="gray-800"
          className="hover:bg-gray-700 w-60"
          theme={{
            base: "items-start",
          }}
        >
          <div className="flex">
            {project?.imageId === "" || project?.imageId == null ? null : (
              <img
                // Load image from base64 string.
                src={images[project._id]}
                alt={project.name}
                className="mr-2 object-contain h-12 w-12"
              />
            )}
            <div>
              <h2 className="text-left text-white">{project?.name}</h2>
              <h3 className="text-left text-gray-500">
                {project?.description}
              </h3>
            </div>
          </div>
        </Button>
      </div>
    </div>
  );
});

ProjectItem.displayName = "ProjectItem";

export default ProjectItem;
