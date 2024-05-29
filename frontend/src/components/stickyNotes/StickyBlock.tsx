/**
 * Sticky note block on the workspace.
 */

import React, { forwardRef, useImperativeHandle } from "react";
import toast from "react-hot-toast";
import { HiDotsHorizontal, HiTrash } from "react-icons/hi";
import { MdDragIndicator } from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Dropdown, Textarea } from "flowbite-react";
import { Resizable } from "re-resizable";

import api from "api";

const StickyBlock = forwardRef(
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
    if (block.stickyText == null) {
      block.stickyText = "";
    }

    const queryClient = useQueryClient();
    const [textView, setTextView] = React.useState("");
    const [editView, setEditView] = React.useState("hidden");
    const [text, setText] = React.useState(block.stickyText);
    const inputRef = React.useRef<HTMLTextAreaElement>(null);
    const [hidden, setHidden] = React.useState("hidden");

    // Add hover effects.
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

    const editStickyNote = useMutation({
      mutationFn: async () => {
        await api.patch(`/stickyNotes/${block._id}`, { text });
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["blocks"] });
      },
    });

    const deleteStickyNote = useMutation({
      mutationFn: async () => {
        await api.delete(`/blocks/${block._id}`);
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["blocks"] });
        toast.success("Sticky note deleted!");
      },
    });

    // Allows the workspace (parent component) to use a callback and delete the block
    useImperativeHandle(ref, () => ({
      deleteBlock() {
        deleteStickyNote.mutate();
      },
    }));

    const editBlock = useMutation({
      mutationFn: async (variables: {
        width: number | undefined;
        height: number | undefined;
      }) => {
        const { width, height } = variables;
        if (width !== undefined && height !== undefined) {
          await api.patch(`/blocks/${block._id}`, { width, height });
        }
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["blocks"] });
      },
    });

    // If the user clicks on the card to edit it, focus the block so the cursor appears.
    React.useEffect(() => {
      if (inputRef.current != null) {
        inputRef.current.focus();
      }
    });

    return (
      <Resizable
        defaultSize={{ width: block.width ?? 320, height: block.height ?? 320 }}
        onResizeStop={(e, direction, ref, d) => {
          editBlock.mutate({
            width: ref.offsetWidth,
            height: ref.offsetHeight,
          });
        }}
        enable={{
          top: false,
          right: false,
          bottom: false,
          left: false,
          topRight: false,
          bottomRight: true,
          bottomLeft: false,
          topLeft: false,
        }}
        minWidth={128}
        minHeight={128}
      >
        <Card
          className={`h-full w-full resize absolute ${
            mostRecentBlock ? "z-10" : "z-0"
          }`}
          onMouseEnter={(e) => {
            showButton(e);
          }}
          onMouseLeave={(e) => {
            hideButton(e);
          }}
          theme={{
            root: {
              base: "flex border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800",
              children: "flex h-full flex-col justify-start gap-4 p-6",
            },
          }}
        >
          <div className="flex justify-end">
            <div className="flex absolute">
              <div
                className={`mt-auto ml-2 ${hidden}`}
                data-testid="sticky-dropdown-button"
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
                    data-testid="delete-sticky-block"
                  >
                    Delete
                  </Dropdown.Item>
                </Dropdown>
              </div>
              <Button
                className={`w-9 h-9 ml-3 ${hidden}`}
                data-testid="sticky-drag-button"
                {...listeners}
                color={"light"}
                theme={{
                  size: {
                    md: "text-sm",
                  },
                }}
              >
                <MdDragIndicator className="h-6 w-6" />
              </Button>
            </div>
          </div>
          <div
            onDoubleClick={() => {
              setTextView("hidden");
              setEditView("");
            }}
            onBlur={() => {
              setTextView("");
              setEditView("hidden");
              editStickyNote.mutate();
            }}
            className="h-full w-full"
          >
            <p
              className={`overflow-auto h-full w-full whitespace-pre-wrap text-gray-900 dark:text-white ${textView}`}
              data-testid="sticky-text"
            >
              {block.stickyText}
            </p>
            <Textarea
              id="text"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
              }}
              ref={inputRef}
              className={`${editView} h-full w-full resize-none`}
              data-testid="sticky-textarea"
            />
          </div>
        </Card>
      </Resizable>
    );
  }
);

StickyBlock.displayName = "StickyBlock";
export default StickyBlock;
