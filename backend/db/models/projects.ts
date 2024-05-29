/***
 * Mongoose models related to workspace projects.
 */

import { model, Schema } from "mongoose";

interface IProject {
  blockId: string;
  name: string;
  imageId: string;
  imageName: string;
  description: string;
  notes: string;
}

const projectSchema = new Schema<IProject>({
  blockId: { type: String, required: true },
  name: { type: String, required: true },
  imageId: { type: String },
  imageName: { type: String },
  description: { type: String },
  notes: { type: String },
});

const Project = model<IProject>("Project", projectSchema);

export default Project;
