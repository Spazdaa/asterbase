/** Wrapper on ProjectItem that allows it to be dragged in a sortable list. */

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import ProjectItem from "./ProjectItem";

function SortableProjectItem(props: {
  onClick: () => void;
  project: Project;
  images: Record<string, string | undefined>;
}): JSX.Element {
  const { onClick, project, images } = props;
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: project._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <ProjectItem
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      project={project}
      images={images}
      {...attributes}
      {...listeners}
    />
  );
}

export default SortableProjectItem;
