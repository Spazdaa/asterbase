/**
 * Workspace-related functions for reading and writing to the MongoDB database.
 */

import Workspace from "./models/workspaces";

export async function createWorkspace(
  userId: string,
  name: string
): Promise<any> {
  const workspace = await Workspace.create({
    userId,
    name,
  });

  return workspace;
}

export async function getWorkspaces(userId: string): Promise<any> {
  return await Workspace.find({ userId }).lean();
}
