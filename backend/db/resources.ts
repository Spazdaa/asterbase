/**
 * Workspace resource-related functions for reading and writing to the MongoDB database.
 */

import Resource from "./models/resources";

export async function createResource(
  blockId: string,
  name: string,
  imageId?: string,
  imageName?: string,
  notes?: string
): Promise<any> {
  const resource = await Resource.create({
    blockId,
    name,
    imageId,
    imageName,
    notes,
  });

  return resource;
}

export async function getResources(blockId: string): Promise<any> {
  const resources = await Resource.find({ blockId }).lean();
  return resources;
}

export async function getResource(resourceId: string): Promise<any> {
  const resource = await Resource.findOne({ _id: resourceId }).lean();
  return resource;
}

export async function updateResource(
  resourceId: string,
  name: string,
  imageId?: string,
  imageName?: string,
  notes?: string
): Promise<any> {
  await Resource.updateOne(
    { _id: resourceId },
    { name, imageId, imageName, notes }
  );
  const resource = await Resource.findOne({ _id: resourceId }).lean();
  return resource;
}

export async function deleteResource(resourceId: string): Promise<void> {
  await Resource.deleteOne({ _id: resourceId });
}

export async function deleteResources(blockId: string): Promise<any> {
  const resources = await Resource.find({ blockId }).lean();
  await Resource.deleteMany({ blockId });
  return resources;
}
