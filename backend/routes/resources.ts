/**
 * Endpoints related to resources used in workspace blocks.
 */

import express, { type RequestHandler } from "express";
import mongoose from "mongoose";

import { updateUserStorage } from "../db/auth";
import { addBlockItem, deleteBlockItem, getBlock } from "../db/blocks";
import { bucket } from "../db/db";
import {
  createResource,
  deleteResource,
  getResource,
  getResources,
  updateResource,
} from "../db/resources";
import { bsonSize, imageUpload } from "../utils";
const createError = require("http-errors");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: resources
 *     description: Resource endpoints
 *
 * components:
 *   schemas:
 *     ResourceRequest:
 *       type: object
 *       properties:
 *         blockId:
 *           type: string
 *           description: ID of the block that the resource belongs to
 *           example: abcdef1234
 *         name:
 *           type: string
 *           description: The name of the resource
 *           example: Resource 1
 *         resource-image:
 *           type: string
 *           format: binary
 *           description: An image representing the resource
 *         notes:
 *           type: string
 *           description: Miscellaneous resource notes
 *           example: My notes
 *       xml:
 *         name: resourcerequest
 *     ResourceUpdateRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the resource
 *           example: Resource 1
 *         resource-image:
 *           type: string
 *           format: binary
 *           description: An image representing the resource
 *         notes:
 *           type: string
 *           description: Miscellaneous resource notes
 *           example: My notes
 *       xml:
 *         name: resourceupdaterequest
 *     ResourceResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID of the resource
 *           example: abcdef1234
 *         blockId:
 *           type: string
 *           description: ID of the block that the resource belongs to
 *           example: abcdef1234
 *         name:
 *           type: string
 *           description: The name of the resource
 *           example: resource
 *         imageId:
 *           type: string
 *           description: The ID of an image representing the resource
 *           example: abcdefg1234
 *         imageName:
 *           type: string
 *           description: The filename of an image representing the resource
 *           example: image.png
 *         notes:
 *           type: string
 *           description: Miscellaneous resource notes
 *           example: My notes
 *       xml:
 *         name: blockrequest
 */

/**
 * @swagger
 * /resources:
 *   post:
 *     tags:
 *       - resources
 *     summary: Create a resource
 *     description: Create a resource to be used in a workspace block
 *     operationId: createResource
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ResourceRequest'
 *       required: true
 *     responses:
 *       '201':
 *         description: Successfully created resource
 *       '401':
 *         description: Not logged in
 *       '500':
 *         description: Internal server error
 */
router.post("", imageUpload.single("resource-image"), (async (
  req,
  res,
  next
) => {
  try {
    const resource = await createResource(
      req.body.blockId,
      req.body.name,
      req.file?.id,
      req.file?.originalname,
      req.body.notes
    );
    // Add resource to list of block items.
    const oldBlock = await getBlock(req.body.blockId);
    const newBlock = await addBlockItem(
      req.body.blockId,
      resource._id.toString()
    );
    // Add size of created document to user's storage.
    let imageSize = 0;
    if (req.file !== undefined) {
      const image = await bucket.find(req.file?.id).next();
      imageSize = image != null ? image.length : 0;
    }
    await updateUserStorage(
      req.session?.userId,
      bsonSize(resource) + (bsonSize(newBlock) - bsonSize(oldBlock)) + imageSize
    );
    res.status(201).end();
  } catch (err) {
    next(createError(500, err));
  }
}) as RequestHandler);

/**
 * @swagger
 * /resources/{blockId}:
 *   get:
 *     tags:
 *       - resources
 *     summary: Get all resources
 *     description: Get all resources that are used in a workspace block
 *     parameters:
 *       - in: path
 *         name: blockId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the block that the resource belongs to
 *     operationId: getResources
 *     responses:
 *       '200':
 *         description: Successfully retrieved all resources
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ResourceResponse'
 *       '401':
 *         description: Not logged in
 *       '500':
 *         description: Internal server error
 */
router.get("/:blockId", (async (req, res, next) => {
  try {
    const resources = await getResources(req.params.blockId);
    for (const resource of resources) {
      resource._id = resource._id.toString();
      // Ignore the __v field, which comes from mongoose.
      delete resource.__v;
    }
    res.status(200).send(resources);
  } catch (err) {
    next(createError(500, err));
  }
}) as RequestHandler);

/**
 * @swagger
 * /resources/images/{imageId}:
 *   get:
 *     tags:
 *       - resources
 *     summary: Get a resource image
 *     parameters:
 *       - in: path
 *         name: imageId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the image to retrieve
 *     operationId: getResourceImage
 *     responses:
 *       '200':
 *         description: Successfully retrieved image
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       '401':
 *         description: Not logged in
 *       '500':
 *         description: Internal server error
 */
router.get("/images/:imageId", (async (req, res, next) => {
  try {
    // Create a stream to read from the bucket.
    const downloadStream = bucket.openDownloadStream(
      new mongoose.Types.ObjectId(req.params.imageId)
    );
    downloadStream.on("error", (err) => {
      next(createError(500, err));
    });
    // Pipe the image to the response object.
    downloadStream.pipe(res);
  } catch (err) {
    next(createError(500, err));
  }
}) as RequestHandler);

/**
 * @swagger
 * /resources/{resourceId}:
 *   patch:
 *     tags:
 *       - resources
 *     summary: Update a resource
 *     description: Update a resource used in a workspace block
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the resource to update
 *     operationId: updateResource
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ResourceUpdateRequest'
 *       required: true
 *     responses:
 *       '204':
 *         description: Successfully updated resource
 *       '401':
 *         description: Not logged in
 *       '500':
 *         description: Internal server error
 */
router.patch("/:resourceId", imageUpload.single("resource-image"), (async (
  req,
  res,
  next
) => {
  try {
    // Get current resource image ID.
    const oldResource = await getResource(req.params.resourceId);
    const newResource = await updateResource(
      req.params.resourceId,
      req.body.name,
      req.file?.id,
      req.file?.originalname,
      req.body.notes
    );

    // Delete previous resource image if it has been changed.
    let oldImageSize = 0;
    let newImageSize = 0;
    if (req.file?.id !== undefined && oldResource.imageId !== undefined) {
      const oldImageId = new mongoose.Types.ObjectId(oldResource.imageId);
      const oldImage = await bucket.find(oldImageId).next();
      oldImageSize = oldImage != null ? oldImage.length : 0;
      const newImage = await bucket.find(req.file?.id).next();
      newImageSize = newImage != null ? newImage.length : 0;
      await bucket.delete(oldImageId);
    }

    // Update user's storage based on the difference of the new and old resource documents.
    await updateUserStorage(
      req.session?.userId,
      bsonSize(newResource) -
        bsonSize(oldResource) +
        (newImageSize - oldImageSize)
    );
    res.status(204).end();
  } catch (err) {
    next(createError(500, err));
  }
}) as RequestHandler);

/**
 * @swagger
 * /resources/{resourceId}:
 *   delete:
 *     tags:
 *       - resources
 *     summary: Delete a resource
 *     description: Delete a resource from a workspace block
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the resource to delete
 *     operationId: deleteResource
 *     responses:
 *       '204':
 *         description: Successfully deleted resource
 *       '401':
 *         description: Not logged in
 *       '500':
 *         description: Internal server error
 */
router.delete("/:resourceId", (async (req, res, next) => {
  try {
    // Get current resource image ID.
    const resource = await getResource(req.params.resourceId);
    await deleteResource(req.params.resourceId);
    // Delete resource image if it exists.
    let imageSize = 0;
    if (resource.imageId !== undefined) {
      const imageId = new mongoose.Types.ObjectId(resource.imageId);
      const image = await bucket.find(imageId).next();
      imageSize = image != null ? image.length : 0;
      await bucket.delete(imageId);
    }
    // Remove resource from list of block items.
    const oldBlock = await getBlock(resource.blockId);
    const newBlock = await deleteBlockItem(
      resource.blockId,
      req.params.resourceId
    );

    // Subtract size of deleted documents from user's storage.
    await updateUserStorage(
      req.session?.userId,
      -(
        bsonSize(resource) +
        (bsonSize(oldBlock) - bsonSize(newBlock)) +
        imageSize
      )
    );
    res.status(204).end();
  } catch (err) {
    next(createError(500, err));
  }
}) as RequestHandler);

module.exports = router;
