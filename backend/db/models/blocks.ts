/***
 * Mongoose models related to workspace blocks.
 */

import { model, Schema } from "mongoose";

interface IBlock {
  workspaceId: string;
  userId: string;
  type: string;
  x: number;
  y: number;
  createdAt: Date;
  width?: number;
  height?: number;
  items?: string[];
}

const blockSchema = new Schema<IBlock>(
  {
    workspaceId: { type: String, required: true },
    userId: { type: String, required: true },
    type: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number },
    height: { type: Number },
    items: [{ type: String }],
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const Block = model<IBlock>("Block", blockSchema);

export default Block;
