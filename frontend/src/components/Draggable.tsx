/**
 * Draggable wrapper component that can be dragged and dropped using dndkit.
 */
import React, { useState } from "react";
import { useDndMonitor, useDraggable } from "@dnd-kit/core";
import { type Coordinates, CSS } from "@dnd-kit/utilities";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import api from "api";

function Draggable(props: {
  children: (listeners: any) => JSX.Element;
  x: number;
  y: number;
  blockId: string;
}): JSX.Element {
  const { blockId } = props;

  const queryClient = useQueryClient();
  const defaultCoordinates = {
    x: props.x,
    y: props.y,
  };
  const { attributes, listeners, setNodeRef, node, transform } = useDraggable({
    id: blockId,
  });
  const style = { transform: CSS.Translate.toString(transform) };
  const [{ x, y }, setCoordinates] = useState<Coordinates>(defaultCoordinates);

  const updateBlock = useMutation({
    mutationFn: async () => {
      await api.patch(`/blocks/${blockId}`, { x, y });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["blocks"] });
    },
  });

  useDndMonitor({
    onDragStart(e) {
      // Set the z-index of the dragged element to 1 and the rest to 0.
      const draggables = Array.from(
        document.getElementsByClassName("draggable")
      );
      for (const draggable of draggables) {
        (draggable as HTMLElement).style.zIndex = "0";
      }
      node.current?.style.setProperty("z-index", "1");
    },
    onDragEnd({ delta }) {
      setCoordinates(({ x, y }) => ({
        x: x + delta.x,
        y: y + delta.y,
      }));
      updateBlock.mutate();
    },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        position: "absolute",
        top: y,
        left: x,
        pointerEvents: "auto",
      }}
      data-testid="draggable"
      {...attributes}
      className="draggable"
    >
      {props.children(listeners)}
    </div>
  );
}

export default Draggable;
