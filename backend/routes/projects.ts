/**
 * Endpoints related to projects used in workspace blocks.
 */

import express, { type RequestHandler } from "express";
import mongoose from "mongoose";

import { updateUserStorage } from "../db/auth";
import { addBlockItem, deleteBlockItem, getBlock } from "../db/blocks";
import { bucket } from "../db/db";
import {
  createProject,
  deleteProject,
  getProject,
  getProjects,
  updateProject,
} from "../db/projects";
import { bsonSize, imageUpload } from "../utils";
const createError = require("http-errors");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: projects
 *     description: Project endpoints
 *
 * components:
 *   schemas:
 *     ProjectRequest:
 *       type: object
 *       properties:
 *         blockId:
 *           type: string
 *           description: ID of the block that the project belongs to
 *           example: abcdef1234
 *         name:
 *           type: string
 *           description: The name of the project
 *           example: Project 1
 *         project-image:
 *           type: string
 *           format: binary
 *           description: An image showcasing the project
 *         description:
 *           type: string
 *           description: A description of the project
 *           example: Racing game in browser
 *         notes:
 *           type: string
 *           description: Miscellaneous project notes
 *           example: My notes
 *       xml:
 *         name: projectrequest
 *     ProjectUpdateRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the project
 *           example: Project 1
 *         project-image:
 *           type: string
 *           format: binary
 *           description: An image showcasing the project
 *         description:
 *           type: string
 *           description: A description of the project
 *           example: Racing game in browser
 *         notes:
 *           type: string
 *           description: Miscellaneous project notes
 *           example: My notes
 *       xml:
 *         name: projectupdaterequest
 *     ProjectResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID of the project
 *           example: abcdef1234
 *         blockId:
 *           type: string
 *           description: ID of the block that the project belongs to
 *           example: abcdef1234
 *         name:
 *           type: string
 *           description: The name of the project
 *           example: Project 1
 *         imageId:
 *           type: string
 *           description: The ID of an image showcasing the project
 *           example: abcdefg1234
 *         imageName:
 *           type: string
 *           description: The filename of an image showcasing the project
 *           example: image.png
 *         description:
 *           type: string
 *           description: A description of the project
 *           example: Racing game in browser
 *         notes:
 *           type: string
 *           description: Miscellaneous project notes
 *           example: My notes
 *       xml:
 *         name: projectrequest
 */

/**
 * @swagger
 * /projects:
 *   post:
 *     tags:
 *       - projects
 *     summary: Create a project
 *     description: Create a project to be used in a workspace block
 *     operationId: createProject
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ProjectRequest'
 *       required: true
 *     responses:
 *       '201':
 *         description: Successfully created project
 *       '401':
 *         description: Not logged in
 *       '500':
 *         description: Internal server error
 */
router.post("", imageUpload.single("project-image"), (async (
  req,
  res,
  next
) => {
  try {
    const project = await createProject(
      req.body.blockId,
      req.body.name,
      req.file?.id,
      req.file?.originalname,
      req.body.description,
      req.body.notes
    );
    // Add project to list of block items.
    const oldBlock = await getBlock(req.body.blockId);
    const newBlock = await addBlockItem(
      req.body.blockId,
      project._id.toString()
    );
    // Add size of created document to user's storage.
    let imageSize = 0;
    if (req.file !== undefined) {
      const image = await bucket.find(req.file?.id).next();
      imageSize = image != null ? image.length : 0;
    }
    await updateUserStorage(
      req.session?.userId,
      bsonSize(project) + (bsonSize(newBlock) - bsonSize(oldBlock)) + imageSize
    );
    res.status(201).end();
  } catch (err) {
    next(createError(500, err));
  }
}) as RequestHandler);

/**
 * @swagger
 * /projects/{blockId}:
 *   get:
 *     tags:
 *       - projects
 *     summary: Get all projects
 *     description: Get all projects that are used in a workspace block
 *     parameters:
 *       - in: path
 *         name: blockId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the block that the project belongs to
 *     operationId: getProjects
 *     responses:
 *       '200':
 *         description: Successfully retrieved all projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProjectResponse'
 *       '401':
 *         description: Not logged in
 *       '500':
 *         description: Internal server error
 */
router.get("/:blockId", (async (req, res, next) => {
  try {
    const projects = await getProjects(req.params.blockId);
    for (const project of projects) {
      project._id = project._id.toString();
      // Ignore the __v field, which comes from mongoose.
      delete project.__v;
    }
    res.status(200).send(projects);
  } catch (err) {
    next(createError(500, err));
  }
}) as RequestHandler);

/**
 * @swagger
 * /projects/images/{imageId}:
 *   get:
 *     tags:
 *       - projects
 *     summary: Get a project image
 *     parameters:
 *       - in: path
 *         name: imageId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the image to retrieve
 *     operationId: getProjectImage
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
 * /projects/{projectId}:
 *   patch:
 *     tags:
 *       - projects
 *     summary: Update a project
 *     description: Update a project used in a workspace block
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the project to update
 *     operationId: updateProject
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ProjectUpdateRequest'
 *       required: true
 *     responses:
 *       '204':
 *         description: Successfully updated project
 *       '401':
 *         description: Not logged in
 *       '500':
 *         description: Internal server error
 */
router.patch("/:projectId", imageUpload.single("project-image"), (async (
  req,
  res,
  next
) => {
  try {
    // Get current project image ID.
    const oldProject = await getProject(req.params.projectId);
    const newProject = await updateProject(
      req.params.projectId,
      req.body.name,
      req.file?.id,
      req.file?.originalname,
      req.body.description,
      req.body.notes
    );

    // Delete previous project image if it has been changed.
    let oldImageSize = 0;
    let newImageSize = 0;
    if (req.file?.id !== undefined && oldProject.imageId !== undefined) {
      const oldImageId = new mongoose.Types.ObjectId(oldProject.imageId);
      const oldImage = await bucket.find(oldImageId).next();
      oldImageSize = oldImage != null ? oldImage.length : 0;
      const newImage = await bucket.find(req.file?.id).next();
      newImageSize = newImage != null ? newImage.length : 0;
      await bucket.delete(oldImageId);
    }

    // Update user's storage based on the difference of the new and old project documents.
    await updateUserStorage(
      req.session?.userId,
      bsonSize(newProject) -
        bsonSize(oldProject) +
        (newImageSize - oldImageSize)
    );
    res.status(204).end();
  } catch (err) {
    next(createError(500, err));
  }
}) as RequestHandler);

/**
 * @swagger
 * /projects/{projectId}:
 *   delete:
 *     tags:
 *       - projects
 *     summary: Delete a project
 *     description: Delete a project from a workspace block
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the project to delete
 *     operationId: deleteProject
 *     responses:
 *       '204':
 *         description: Successfully deleted project
 *       '401':
 *         description: Not logged in
 *       '500':
 *         description: Internal server error
 */
router.delete("/:projectId", (async (req, res, next) => {
  try {
    // Get current project image ID.
    const project = await getProject(req.params.projectId);
    await deleteProject(req.params.projectId);
    // Delete project image if it exists.
    let imageSize = 0;
    if (project.imageId !== undefined) {
      const imageId = new mongoose.Types.ObjectId(project.imageId);
      const image = await bucket.find(imageId).next();
      imageSize = image != null ? image.length : 0;
      await bucket.delete(imageId);
    }
    // Remove project from list of block items.
    const oldBlock = await getBlock(project.blockId);
    const newBlock = await deleteBlockItem(
      project.blockId,
      req.params.projectId
    );

    // Subtract size of deleted documents from user's storage.
    await updateUserStorage(
      req.session?.userId,
      -(
        bsonSize(project) +
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
