/**
 * Modal for editing a workspace project block.
 */

import React from "react";
import { HiDotsHorizontal, HiTrash } from "react-icons/hi";
import { MdImage, MdTextSnippet } from "react-icons/md";
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

function EditProjectModal(props: {
  blockId: string;
  project: Project | undefined;
  show: boolean;
  onClose: () => void;
}): JSX.Element {
  const { blockId, project, show, onClose } = props;

  const queryClient = useQueryClient();
  const [name, setName] = React.useState(project?.name ?? "Untitled");
  const [description, setDescription] = React.useState(
    project?.description ?? ""
  );
  const [image, setImage] = React.useState<File | null>(null);
  const [notesView, setNotesView] = React.useState("");
  const [editView, setEditView] = React.useState("hidden");
  const [notes, setNotes] = React.useState(project?.notes ?? "");
  const rootRef = React.useRef(null);
  const [fileInputRef, setFileInputRef] =
    React.useState<HTMLInputElement | null>(null);

  // Pre-populate edit fields.
  React.useEffect(() => {
    if (project !== undefined) {
      setName(project.name);
      setDescription(project.description ?? "");
      setNotes(project.notes ?? "");
    }
  }, [show]);

  const editProject = useMutation({
    mutationFn: async (variables: {
      project: Project | undefined;
      name: string;
      description: string;
      image: File | null;
      notes: string;
    }) => {
      const { project, name, description, image, notes } = variables;

      // Use form data to send image.
      const formData = new FormData();
      formData.append("name", name === "" ? "Untitled" : name);
      formData.append("description", description);
      formData.append("notes", notes);
      if (image !== null) {
        formData.append("project-image", image, image.name);
      }
      if (project !== undefined) {
        // Update existing project.
        await api.patch(`/projects/${project._id}`, formData);
      } else {
        // Otherwise create a new one.
        formData.append("blockId", blockId);
        await api.post("/projects", formData);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["blocks"] });
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (projectId: string | undefined) => {
      if (projectId === undefined) return;
      await api.delete(`/projects/${projectId}`);
      onModalClose();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["blocks"] });
    },
  });

  function onModalUpdate(): void {
    editProject.mutate({ project, name, description, image, notes });
    onModalClose();
  }

  function onModalClose(): void {
    onClose();
    setName("Untitled");
    setDescription("");
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
                data-testid="edit-project-dropdown-button"
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
                      deleteProject.mutate(project?._id);
                    }}
                    data-testid="delete-project"
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
            <div className="mt-8 flex">
              <div className="mr-16 mt-2 flex text-gray-400">
                <MdImage className="mt-1 mr-2" />
                <h4>Project Icon</h4>
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
                {project?.imageName != null && (
                  <div className="mt-1">
                    <Label
                      htmlFor="image"
                      value={`Current file: ${project?.imageName}`}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 mb-2 flex">
              <div className="mr-16 mt-2 flex text-gray-400">
                <MdTextSnippet className="mt-1 mr-2" />
                <h4>Description</h4>
              </div>
              <TextInput
                id="description"
                value={description}
                name="description"
                placeholder="Empty"
                onChange={(e) => {
                  setDescription(e.target.value);
                }}
                theme={{
                  field: {
                    input: {
                      base: "border-0",
                      colors: {
                        gray: "placeholder-gray-500 text-white bg-gray-800",
                      },
                    },
                  },
                }}
              />
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

export default EditProjectModal;
