/**
 * Deletion warning modal that appears when a user attempts to delete a block on the workspace.
 * The user can confirm, cancel or close this modal.
 */

import React from "react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { Button, Modal } from "flowbite-react";

function DeletionWarningModal(props: {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}): JSX.Element {
  const { isOpen, onCancel, onConfirm } = props;

  return (
    <>
      <Modal
        show={isOpen}
        size="md"
        popup
        position="center"
        onClose={onCancel}
        data-testid="deletion-modal"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this item? This action cannot be
              undone.
            </h3>
            <div className="flex justify-center gap-4">
              <Button
                color="failure"
                onClick={onConfirm}
                data-testid="confirm-deletion"
              >
                Confirm
              </Button>
              <Button
                color="gray"
                onClick={onCancel}
                data-testid="cancel-deletion"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default DeletionWarningModal;
