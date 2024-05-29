/**
 * Workspace block-related functions for reading and writing to the MongoDB database.
 */

import Block from "./models/blocks";

export async function createBlock(
  workspaceId: string,
  userId: string,
  type: string,
  x: number,
  y: number,
  width?: number,
  height?: number
): Promise<any> {
  const block = await Block.create({
    workspaceId,
    userId,
    type,
    x,
    y,
    width,
    height,
    items: [],
  });
  return block;
}

export async function getBlocks(
  workspaceId: string,
  userId: string
): Promise<any> {
  const blocks = await Block.find({ workspaceId, userId }).lean();
  return blocks;
}

export async function getBlock(blockId: string): Promise<any> {
  const block = await Block.findOne({ _id: blockId }).lean();
  return block;
}

export async function updateBlock(
  blockId: string,
  x: number,
  y: number,
  width?: number,
  height?: number,
  items?: string[]
): Promise<any> {
  await Block.updateOne({ _id: blockId }, { x, y, width, height, items });
  const block = await Block.findOne({ _id: blockId }).lean();
  return block;
}

export async function deleteBlock(blockId: string): Promise<any> {
  const block = await Block.findOne({ _id: blockId }).lean();
  await Block.deleteOne({ _id: blockId });
  return block;
}

export async function addBlockItem(
  blockId: string,
  itemId: string
): Promise<any> {
  await Block.updateOne({ _id: blockId }, { $push: { items: itemId } });
  const block = await Block.findOne({ _id: blockId }).lean();
  return block;
}

export async function deleteBlockItem(
  blockId: string,
  itemId: string
): Promise<any> {
  await Block.updateOne({ _id: blockId }, { $pull: { items: itemId } });
  const block = await Block.findOne({ _id: blockId }).lean();
  return block;
}
