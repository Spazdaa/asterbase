/***
 * Mongoose models related to workspace sticky notes.
 */

import { model, Schema } from "mongoose";

interface IStickyNote {
  blockId: string;
  text: string;
}

const stickyNoteSchema = new Schema<IStickyNote>({
  blockId: { type: String, required: true },
  text: { type: String, required: true },
});

const StickyNote = model<IStickyNote>("StickyNote", stickyNoteSchema);

export default StickyNote;
