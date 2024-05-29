/***
 * Mongoose models related to workspaces.
 */

import { model, Schema } from "mongoose";

interface IWorkspace {
  userId: string;
  name: string;
}

const workspaceSchema = new Schema<IWorkspace>({
  userId: { type: String, required: true },
  name: { type: String, required: true },
});

const Workspace = model<IWorkspace>("Workspace", workspaceSchema);

export default Workspace;
