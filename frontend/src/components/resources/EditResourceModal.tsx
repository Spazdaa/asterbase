/**
 * Modal for editing a workspace resource block.
 */

import React from "react";
import { HiDotsHorizontal, HiTrash } from "react-icons/hi";
import { MdImage } from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dropdown,
  FileInput,
  Label,
  Modal,
  Textarea,
  TextInput,
} from "flowbite-react";

import api from "api";

function EditResourceModal(props: {
  blockId: string;
  resource: Resource | undefined;
  show: boolean;
  onClose: () => void;
}): JSX.Element {
  const { blockId, resource, show, onClose } = props;

  const queryClient = useQueryClient();
  const [name, setName] = React.useState(resource?.name ?? "Untitled");
  const [image, setImage] = React.useState<File | null>(null);
  const [notesView, setNotesView] = React.useState("");
  const [editView, setEditView] = React.useState("hidden");
  const [notes, setNotes] = React.useState(resource?.notes ?? "");
  const rootRef = React.useRef(null);
  const [fileInputRef, setFileInputRef] =
    React.useState<HTMLInputElement | null>(null);

  // Pre-populate edit fields.
  React.useEffect(() => {
    if (resource !== undefined) {
      setName(resource.name);
      setNotes(resource.notes ?? "");
    }
  }, [show]);

  const editResource = useMutation({
    mutationFn: async (variables: {
      resource: Resource | undefined;
      name: string;
      image: File | null;
      notes: string;
    }) => {
      const { resource, name, image, notes } = variables;

      // Use form data to send image.
      const formData = new FormData();
      formData.append("name", name === "" ? "Untitled" : name);
      formData.append("notes", notes);
      if (image !== null) {
        formData.append("resource-image", image, image.name);
      }
      if (resource !== undefined) {
        // Update existing resource.
        await api.patch(`/resources/${resource._id}`, formData);
      } else {
        // Otherwise create a new one.
        formData.append("blockId", blockId);
        await api.post("/resources", formData);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["blocks"] });
    },
  });

  const deleteResource = useMutation({
    mutationFn: async (resourceId: string | undefined) => {
      if (resourceId === undefined) return;
      await api.delete(`/resources/${resourceId}`);
      onModalClose();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["blocks"] });
    },
  });

  function onModalUpdate(): void {
    editResource.mutate({ resource, name, image, notes });
    onModalClose();
  }

  function onModalClose(): void {
    onClose();
    setName("Untitled");
    setNotes("");
    if (fileInputRef != null) {
      fileInputRef.value = "";
    }
    setImage(null);
  }

  return (
    <div ref={rootRef}>
      <Modal
        show={show}
        onClose={onModalUpdate}
        popup
        root={rootRef.current ?? undefined}
        dismissible
        theme={{
          content: {
            inner:
              "relative rounded-lg bg-white shadow dark:bg-gray-800 flex flex-col max-h-[90vh]",
          },
        }}
      >
        <Modal.Body className="mt-8">
          <form className="px-8">
            <div className="flex justify-end">
              <div
                className="flex absolute mt-auto ml-2"
                data-testid="edit-resource-dropdown-button"
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
                      deleteResource.mutate(resource?._id);
                    }}
                    data-testid="delete-resource"
                  >
                    Delete
                  </Dropdown.Item>
                </Dropdown>
              </div>
            </div>
            <div className="mr-16">
              <TextInput
                id="name"
                value={name}
                name="name"
                placeholder="Untitled"
                onChange={(e) => {
                  setName(e.target.value);
                }}
                color="gray"
                sizing="lg"
                theme={{
                  field: {
                    input: {
                      base: "border-0",
                      sizes: {
                        lg: "text-3xl",
                      },
                      colors: {
                        gray: "placeholder-gray-500 text-white bg-gray-800",
                      },
                    },
                  },
                }}
              />
            </div>
            <div className="mt-8 mb-2 flex">
              <div className="mr-16 mt-2 flex text-gray-400">
                <MdImage className="mt-1 mr-2" />
                <h4>Resource Icon</h4>
              </div>
              <div>
                <FileInput
                  id="image"
                  name="image"
                  onChange={(e) => {
                    if (e.target.files !== null) {
                      setImage(e.target.files[0]);
                    }
                  }}
                  ref={(ref) => {
                    setFileInputRef(ref);
                  }}
                />
                {resource?.imageName != null && (
                  <div className="mt-1">
                    <Label
                      htmlFor="image"
                      value={`Current file: ${resource?.imageName}`}
                    />
                  </div>
                )}
              </div>
            </div>
            <div
              onClick={() => {
                setNotesView("hidden");
                setEditView("");
              }}
              onBlur={() => {
                setNotesView("");
                setEditView("hidden");
              }}
              className="h-full w-full mt-6 mb-4"
            >
              <p
                className={`overflow-auto h-full w-full whitespace-pre-wrap text-gray-900 dark:text-white ${notesView}`}
                data-testid="sticky-text"
              >
                {notes === "" ? "Add notes here..." : notes}
              </p>
              <Textarea
                id="text"
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                }}
                className={`${editView} h-32 w-full resize-none`}
                data-testid="sticky-textarea"
              />
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default EditResourceModal;
