/**
 * Individual workspace screen.
 */

import React from "react";
import toast from "react-hot-toast";
import {
  HiBookOpen,
  HiCloud,
  HiCollection,
  HiDocumentText,
} from "react-icons/hi";
import { useNavigate, useParams } from "react-router-dom";
import { DndContext, type Modifier } from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dropdown } from "flowbite-react";
import { blobToString } from "utils";

import api from "api";
import DeletionWarningModal from "components/DeletionWarningModal";
import Draggable from "components/Draggable";
import ProjectBlock from "components/projects/ProjectBlock";
import ResourceBlock from "components/resources/ResourceBlock";
import Sidebar from "components/Sidebar";
import StickyBlock from "components/stickyNotes/StickyBlock";

import "../styles/scrollbar.css";

export const findNewestBlock = (blocks: Block[]): Block => {
  const blocksWithCreatedAt = blocks.filter(
    (block) => block.createdAt !== undefined
  );

  // If all blocks lack a createdAt property return the first block in the array by default
  if (blocksWithCreatedAt.length === 0) {
    return blocks[0];
  }

  const newestBlock = blocksWithCreatedAt.reduce(
    (latest: Block, current: Block) => {
      if (
        // createdAt property should be defined for both current and latest
        current.createdAt !== undefined &&
        latest.createdAt !== undefined &&
        current.createdAt > latest.createdAt
      ) {
        return current;
      } else {
        return latest;
      }
    }
  );
  return newestBlock;
};

function Workspace(): JSX.Element {
  const navigate = useNavigate();
  const { workspaceId } = useParams();
  const queryClient = useQueryClient();
  const [showDeletionWarningModal, setShowDeletionWarningModal] =
    React.useState<boolean>(false);
  const blockDeleteRef = React.useRef<{ deleteBlock: () => void } | null>(null); // Used to allow the parent component (workspace) to confirm and delete child components (block)
  const [mostRecentBlockId, setMostRecentBlockId] = React.useState<
    string | null
  >(null);

  // Check if this workspace exists. If not, redirect to not found page.
  useQuery({
    queryKey: ["workspaceExists"],
    queryFn: async () => {
      const response = await api.get("/workspaces");
      const workspaceIds: any[] = response.data.map(
        (workspace: any) => workspace._id
      );
      if (!workspaceIds.includes(workspaceId)) {
        navigate("/error");
      }

      return true;
    },
  });

  const { data: blocks, isSuccess } = useQuery({
    queryKey: ["blocks"],
    queryFn: async (): Promise<Block[]> => {
      const { data: blocks } = await api.get<Block[]>(
        `/blocks/${workspaceId as string}`
      );

      for (const block of blocks) {
        if (block.type === "project" && block.projects !== undefined) {
          // Fetch image for each project.
          const projectImages: Record<string, string | undefined> = {};
          for (const project of block.projects) {
            if (project.imageId != null) {
              const response = await api.get(
                `/projects/images/${project.imageId}`,
                {
                  responseType: "blob",
                }
              );
              projectImages[project._id] = await blobToString(response.data);
            }
          }
          block.images = projectImages;
        } else if (block.type === "resource" && block.resources !== undefined) {
          // Fetch image for each resources.
          const resourceImages: Record<string, string | undefined> = {};
          for (const resource of block.resources) {
            if (resource.imageId != null) {
              const response = await api.get(
                `/resources/images/${resource.imageId}`,
                {
                  responseType: "blob",
                }
              );
              resourceImages[resource._id] = await blobToString(response.data);
            }
          }
          block.images = resourceImages;
        }
      }

      return blocks;
    },
  });

  // Finds the most recently created block to display it on top of all existing blocks
  React.useEffect(() => {
    if (isSuccess && !(blocks.length === 0)) {
      const newestBlock = findNewestBlock(blocks);
      setMostRecentBlockId(newestBlock._id);
    }
  }, [isSuccess, blocks]);

  const addBlock = useMutation({
    mutationFn: async (type: string) => {
      // Initialize block position to be at the top left corner.
      await api.post("/blocks", { workspaceId, type, x: 0, y: 0 });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["blocks"] });
      toast.success("Block created!");
    },
  });

  // Snap block movement to grid (32px by 32px).
  function createSnapModifier(gridSize: number): Modifier {
    return (args) => {
      const { transform, activeNodeRect, containerNodeRect } = args;
      if (activeNodeRect != null && containerNodeRect != null) {
        const oldX = activeNodeRect.left - containerNodeRect.left;
        const oldY = activeNodeRect.top - containerNodeRect.top;
        const newX = Math.ceil((oldX + transform.x) / gridSize) * gridSize;
        const newY = Math.ceil((oldY + transform.y) / gridSize) * gridSize;

        return {
          ...transform,
          x: newX - oldX,
          y: newY - oldY,
        };
      } else {
        return { ...transform };
      }
    };
  }
  const snapToGridModifier = createSnapModifier(32);

  return (
    <div className="flex overflow-hidden bg-white dark:bg-gray-900">
      <Sidebar />
      <DeletionWarningModal
        isOpen={showDeletionWarningModal}
        onCancel={() => {
          setShowDeletionWarningModal(false);
        }}
        onConfirm={() => {
          blockDeleteRef.current?.deleteBlock();
          setShowDeletionWarningModal(false);
        }}
      />
      <div className="ml-64 w-screen h-screen overflow-hidden">
        <div className="h-full overflow-scroll">
          <div style={{ width: "8048px" }} className="h-24 bg-green-800" />
          <div className="text-3xl font-bold text-gray-900 dark:text-white mx-12 my-6">
            <div className="flex items-center" data-testid="workspace-title">
              <HiCloud className="mr-2" size={40} />
              Workspace
            </div>
          </div>
          <div className="flex flex-wrap gap-8 mx-12 relative">
            {isSuccess ? (
              blocks.map((block) => {
                if (block.type === "project") {
                  return (
                    <DndContext
                      key={block._id}
                      modifiers={[restrictToParentElement, snapToGridModifier]}
                    >
                      <div className="absolute top-0 left-0 pointer-events-none">
                        <div className="relative h-[8000px] w-[8000px]">
                          <Draggable
                            x={block.x}
                            y={block.y}
                            blockId={block._id}
                          >
                            {(listeners) => (
                              <ProjectBlock
                                ref={blockDeleteRef}
                                block={block}
                                listeners={listeners}
                                setShowDeletionWarningModal={
                                  setShowDeletionWarningModal
                                }
                                mostRecentBlock={
                                  mostRecentBlockId === block._id
                                }
                              />
                            )}
                          </Draggable>
                        </div>
                      </div>
                    </DndContext>
                  );
                } else if (block.type === "resource") {
                  return (
                    <DndContext
                      key={block._id}
                      modifiers={[restrictToParentElement, snapToGridModifier]}
                    >
                      <div className="absolute top-0 left-0 pointer-events-none">
                        <div className="relative h-[8000px] w-[8000px]">
                          <Draggable
                            x={block.x}
                            y={block.y}
                            blockId={block._id}
                          >
                            {(listeners) => (
                              <ResourceBlock
                                ref={blockDeleteRef}
                                block={block}
                                listeners={listeners}
                                setShowDeletionWarningModal={
                                  setShowDeletionWarningModal
                                }
                                mostRecentBlock={
                                  mostRecentBlockId === block._id
                                }
                              />
                            )}
                          </Draggable>
                        </div>
                      </div>
                    </DndContext>
                  );
                } else if (block.type === "sticky") {
                  return (
                    <DndContext
                      key={block._id}
                      modifiers={[restrictToParentElement, snapToGridModifier]}
                    >
                      <div className="absolute top-0 left-0 pointer-events-none">
                        <div className="relative h-[8000px] w-[8000px]">
                          <Draggable
                            x={block.x}
                            y={block.y}
                            blockId={block._id}
                          >
                            {(listeners) => (
                              <StickyBlock
                                ref={blockDeleteRef}
                                block={block}
                                listeners={listeners}
                                setShowDeletionWarningModal={
                                  setShowDeletionWarningModal
                                }
                                mostRecentBlock={
                                  mostRecentBlockId === block._id
                                }
                              />
                            )}
                          </Draggable>
                        </div>
                      </div>
                    </DndContext>
                  );
                } else {
                  return <div key={block._id}>Error</div>;
                }
              })
            ) : (
              <></>
            )}
          </div>
          <div
            className="bottom-0 mx-8 my-8 fixed"
            id="add-block-button"
            style={{ zIndex: 1 }}
          >
            <Dropdown
              label="+ ADD BLOCK"
              placement="top-start"
              arrowIcon={false}
              color="dark"
            >
              <div className="text-lg text-center font-bold mb-6 mt-4 w-64 text-gray-900 dark:text-white">
                Add a New Block
              </div>
              <div className="mx-4 mb-2">Basic</div>
              <Dropdown.Item
                icon={HiDocumentText}
                onClick={() => {
                  addBlock.mutate("sticky");
                }}
              >
                Sticky Note
              </Dropdown.Item>
              <Dropdown.Item
                icon={HiCollection}
                onClick={() => {
                  addBlock.mutate("project");
                }}
              >
                Projects
              </Dropdown.Item>
              <Dropdown.Item
                icon={HiBookOpen}
                onClick={() => {
                  addBlock.mutate("resource");
                }}
              >
                Resources
              </Dropdown.Item>
            </Dropdown>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Workspace;
