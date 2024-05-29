/** Wrapper on ResourceItem that allows it to be dragged in a sortable list. */

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import ResourceItem from "./ResourceItem";

function SortableResourceItem(props: {
  onClick: () => void;
  resource: Resource;
  images: Record<string, string | undefined>;
}): JSX.Element {
  const { onClick, resource, images } = props;
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: resource._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <ResourceItem
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      resource={resource}
      images={images}
      {...attributes}
      {...listeners}
    />
  );
}

export default SortableResourceItem;
