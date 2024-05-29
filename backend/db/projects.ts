/**
 * Workspace project-related functions for reading and writing to the MongoDB database.
 */

import Project from "./models/projects";

export async function createProject(
  blockId: string,
  name: string,
  imageId?: string,
  imageName?: string,
  description?: string,
  notes?: string
): Promise<any> {
  const project = await Project.create({
    blockId,
    name,
    imageId,
    imageName,
    description,
    notes,
  });

  return project;
}

export async function getProjects(blockId: string): Promise<any> {
  const projects = await Project.find({ blockId }).lean();
  return projects;
}

export async function getProject(projectId: string): Promise<any> {
  const project = await Project.findOne({ _id: projectId }).lean();
  return project;
}

export async function updateProject(
  projectId: string,
  name: string,
  imageId?: string,
  imageName?: string,
  description?: string,
  notes?: string
): Promise<any> {
  await Project.updateOne(
    { _id: projectId },
    { name, imageId, imageName, description, notes }
  );
  const project = await Project.findOne({ _id: projectId }).lean();
  return project;
}

export async function deleteProject(blockId: string): Promise<void> {
  await Project.deleteOne({ _id: blockId });
}

export async function deleteProjects(blockId: string): Promise<any> {
  const projects = await Project.find({ blockId }).lean();
  await Project.deleteMany({ blockId });
  return projects;
}
