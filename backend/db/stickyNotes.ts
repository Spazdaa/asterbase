/**
 * Workspace sticky note-related functions for reading and writing to the MongoDB database.
 */

import StickyNote from "./models/stickyNotes";

export async function createStickyNote(
  blockId: string,
  text: string
): Promise<any> {
  const stickyNote = await StickyNote.create({
    blockId,
    text,
  });
  return stickyNote;
}

export async function getStickyNote(blockId: string): Promise<any> {
  const stickyNotes = await StickyNote.find({ blockId }).lean();
  // We only expect one sticky note per block.
  if (stickyNotes.length > 0) {
    return stickyNotes[0];
  }
  return null;
}

export async function updateStickyNote(
  blockId: string,
  text: string
): Promise<any> {
  await StickyNote.updateOne({ blockId }, { text }, { upsert: true });
  const stickyNote = await StickyNote.findOne({ blockId }).lean();
  return stickyNote;
}

export async function deleteStickyNote(blockId: string): Promise<any> {
  const stickyNote = await StickyNote.findOne({ blockId }).lean();
  await StickyNote.deleteOne({ blockId });
  return stickyNote;
}

export async function deleteStickyNotes(blockId: string): Promise<any> {
  const stickyNotes = await StickyNote.find({ blockId }).lean();
  // Here, blockId and stickyNoteIds are the same, since there is only one note per block.
  await StickyNote.deleteMany({ blockId });
  return stickyNotes;
}
