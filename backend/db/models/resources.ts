/***
 * Mongoose models related to workspace resources.
 */

import { model, Schema } from "mongoose";

interface IResource {
  blockId: string;
  name: string;
  imageId: string;
  imageName: string;
  notes: string;
}

const resourceSchema = new Schema<IResource>({
  blockId: { type: String, required: true },
  name: { type: String, required: true },
  imageId: { type: String },
  imageName: { type: String },
  notes: { type: String },
});

const Resource = model<IResource>("Resource", resourceSchema);

export default Resource;
