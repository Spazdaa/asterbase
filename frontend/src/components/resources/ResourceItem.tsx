/** Resource card that displays resource details. */

import React, { forwardRef } from "react";
import { Button } from "flowbite-react";

const ResourceItem = forwardRef<
  HTMLDivElement,
  {
    style: any;
    onClick: () => void;
    resource: Resource | undefined;
    images: Record<string, string | undefined>;
  }
>(({ onClick, resource, images, ...props }, ref) => {
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
            {resource?.imageId === "" || resource?.imageId == null ? null : (
              <img
                // Load image from base64 string.
                src={images[resource._id]}
                alt={resource.name}
                className="mr-2 object-contain h-6 w-6"
              />
            )}
            <div>
              <h2 className="text-left text-white">{resource?.name}</h2>
            </div>
          </div>
        </Button>
      </div>
    </div>
  );
});

ResourceItem.displayName = "ResourceItem";

export default ResourceItem;
