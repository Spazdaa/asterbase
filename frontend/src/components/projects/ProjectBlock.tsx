/**
 * Project block on the workspace.
 */

import React, { forwardRef, useImperativeHandle } from "react";
import toast from "react-hot-toast";
import { HiDotsHorizontal, HiPlusSm, HiTrash } from "react-icons/hi";
import { MdDragIndicator } from "react-icons/md";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Dropdown } from "flowbite-react";

import api from "api";

import EditProjectModal from "./EditProjectModal";
import ProjectItem from "./ProjectItem";
import SortableProjectItem from "./SortableProjectItem";

const ProjectBlock = forwardRef(
  (
    props: {
      ref: React.MutableRefObject<{ deleteBlock: () => void } | null>;
      block: Block;
      listeners: any;
      setShowDeletionWarningModal: React.Dispatch<
        React.SetStateAction<boolean>
      >;
      mostRecentBlock: boolean;
    },
    ref
  ): JSX.Element => {
    const { block, listeners, setShowDeletionWarningModal, mostRecentBlock } =
      props;
    if (block.projects == null) return <div>Error</div>;

    const queryClient = useQueryClient();
    const [hidden, setHidden] = React.useState("hidden");
    const [showEditProjectModal, setShowEditProjectModal] =
      React.useState(false);
    const [currentProject, setCurrentProject] = React.useState<Project>();
    const [activeId, setActiveId] = React.useState<string | null>(null);
    const [items, setItems] = React.useState<Project[]>(block.projects);
    const blockRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (block.projects !== undefined) {
        setItems(block.projects);
      }
    }, [block.projects]);

    // Add hover effects for block actions.
    const showButton = (
      e: React.MouseEvent<HTMLDivElement, MouseEvent>
    ): void => {
      e.preventDefault();
      setHidden("");
    };

    const hideButton = (
      e: React.MouseEvent<HTMLDivElement, MouseEvent>
    ): void => {
      e.preventDefault();
      setHidden("hidden");
    };

    const deleteProjectBlock = useMutation({
      mutationFn: async () => {
        await api.delete(`/blocks/${block._id}`);
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["blocks"] });
        toast.success("Project block deleted!");
      },
    });

    // Allows the workspace (parent component) to use a callback and delete the block
    useImperativeHandle(ref, () => ({
      deleteBlock() {
        deleteProjectBlock.mutate();
      },
    }));

    const updateProjectBlock = useMutation({
      mutationFn: async () => {
        await api.patch(`/blocks/${block._id}`, {
          items: items.map((item) => item._id),
        });
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["blocks"] });
      },
    });

    const handleDragStart = (event: any): void => {
      const { active } = event;

      setActiveId(active.id);
    };

    const handleDragEnd = (event: any): void => {
      const { active, over } = event;

      if (over != null && active.id !== over.id) {
        setItems((items) => {
          const oldIndex = items.findIndex((item) => item._id === active.id);
          const newIndex = items.findIndex((item) => item._id === over.id);

          return arrayMove(items, oldIndex, newIndex);
        });
      }

      // Update the database with the new order.
      updateProjectBlock.mutate();

      setActiveId(null);
    };

    // Don't activated drag until it is moved a certain distance.
    // This enables users to also activate onClick effects for editing the resource.
    const mouseSensor = useSensor(MouseSensor, {
      activationConstraint: {
        distance: 15,
      },
    });
    const sensors = useSensors(mouseSensor);

    return (
      <div ref={blockRef}>
        <Card
          className={`w-80 h-80 absolute ${mostRecentBlock ? "z-10" : "z-0"}`}
          onMouseEnter={(e) => {
            showButton(e);
          }}
          onMouseLeave={(e) => {
            hideButton(e);
          }}
          theme={{
            root: {
              base: "flex border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800",
            },
          }}
        >
          <div className="flex justify-end">
            <div className="flex absolute">
              <Button
                className={`w-9 h-9 ${hidden}`}
                onClick={() => {
                  // Set the z-index of the rest to 0.
                  const draggables = Array.from(
                    document.getElementsByClassName("draggable")
                  );
                  for (const draggable of draggables) {
                    (draggable as HTMLElement).style.zIndex = "0";
                  }
                  // Find ADD BLOCK button element and set its zIndex to 0.
                  const button = document.getElementById("add-block-button");
                  if (button != null) {
                    button.style.zIndex = "0";
                  }
                  (
                    blockRef.current?.parentElement as HTMLElement
                  ).style.zIndex = "1";
                  setShowEditProjectModal(true);
                }}
                data-testid="add-project-button"
                color={"light"}
                theme={{
                  size: {
                    md: "text-sm",
                  },
                }}
              >
                <HiPlusSm className="h-6 w-6" />
              </Button>
              <div
                className={`mt-auto ml-3 ${hidden}`}
                data-testid="project-dropdown-button"
              >
                <Dropdown
                  label={<HiDotsHorizontal className="h-6 w-6" />}
                  placement="bottom-end"
                  arrowIcon={false}
                  color="light"
                  inline
                  theme={{
                    inlineWrapper:
                      "flex h-9 w-9 rounded-md items-center justify-center p-0.5 text-center font-medium relative focus:z-10 dark:bg-gray-600 dark:text-white dark:border-gray-600 dark:enabled:hover:bg-gray-700 dark:enabled:hover:border-gray-700",
                  }}
                >
                  <Dropdown.Item
                    icon={HiTrash}
                    onClick={() => {
                      setShowDeletionWarningModal(true);
                    }}
                    data-testid="delete-project-block"
                  >
                    Delete
                  </Dropdown.Item>
                </Dropdown>
              </div>
            </div>
          </div>
          <Button
            color="dark"
            label={
              <h3 className="text-xl font-medium text-gray-900 dark:text-white flex">
                <MdDragIndicator className="mt-1" />
                Project Block
              </h3>
            }
            theme={{ base: "items-start", label: "items-start" }}
            className={"dark:border-transparent"}
            {...listeners}
          />
          <div className="h-64 overflow-auto">
            <DndContext
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              sensors={sensors}
            >
              <SortableContext items={items.map((item) => item._id)}>
                {items.map((project) => (
                  <SortableProjectItem
                    key={project._id}
                    onClick={() => {
                      setCurrentProject(project);
                      // Set the z-index of the rest to 0.
                      const draggables = Array.from(
                        document.getElementsByClassName("draggable")
                      );
                      for (const draggable of draggables) {
                        (draggable as HTMLElement).style.zIndex = "0";
                      }
                      // Find ADD BLOCK button element and set its zIndex to 0.
                      const button =
                        document.getElementById("add-block-button");
                      if (button != null) {
                        button.style.zIndex = "0";
                      }
                      (
                        blockRef.current?.parentElement as HTMLElement
                      ).style.zIndex = "1";
                      setShowEditProjectModal(true);
                    }}
                    project={project}
                    images={block.images ?? {}}
                  />
                ))}
              </SortableContext>
              <DragOverlay>
                {activeId != null && (
                  <ProjectItem
                    style={undefined}
                    onClick={() => {}}
                    project={block.projects.find(
                      (project) => project._id === activeId
                    )}
                    images={block.images ?? {}}
                  />
                )}
              </DragOverlay>
            </DndContext>
          </div>
        </Card>
        <EditProjectModal
          blockId={block._id}
          project={currentProject}
          show={showEditProjectModal}
          onClose={() => {
            setShowEditProjectModal(false);
            setCurrentProject(undefined);
            const button = document.getElementById("add-block-button");
            if (button != null) {
              button.style.zIndex = "1";
            }
          }}
        />
      </div>
    );
  }
);

ProjectBlock.displayName = "ProjectBlock";
export default ProjectBlock;
