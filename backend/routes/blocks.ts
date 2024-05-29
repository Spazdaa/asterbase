/**
 * Endpoints related to workspace blocks.
 */

import express, { type RequestHandler } from "express";
import mongoose from "mongoose";

import { updateUserStorage } from "../db/auth";
import {
  createBlock,
  deleteBlock,
  getBlock,
  getBlocks,
  updateBlock,
} from "../db/blocks";
import { bucket } from "../db/db";
import { deleteProjects, getProjects } from "../db/projects";
import { deleteResources, getResources } from "../db/resources";
import { deleteStickyNotes, getStickyNote } from "../db/stickyNotes";
import { bsonSize } from "../utils";
const createError = require("http-errors");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: blocks
 *     description: Workspace block endpoints
 *
 * components:
 *   schemas:
 *     BlockRequest:
 *       type: object
 *       properties:
 *         workspaceId:
 *           type: string
 *           description: ID of the workspace that the block belongs to
 *           example: abcdef1234
 *         type:
 *           type: string
 *           description: The type of block
 *           example: resource
 *         x:
 *           type: number
 *           description: The x position of the block
 *           example: 0
 *         y:
 *           type: number
 *           description: The y position of the block
 *           example: 0
 *         width:
 *           type: number
 *           description: The width of the block
 *           example: 80
 *         height:
 *           type: number
 *           description: The height of the block
 *           example: 80
 *       xml:
 *         name: blockrequest
 *     BlockUpdateRequest:
 *       type: object
 *       properties:
 *         x:
 *           type: number
 *           description: The x position of the block
 *           example: 0
 *         y:
 *           type: number
 *           description: The y position of the block
 *           example: 0
 *         width:
 *           type: number
 *           description: The width of the block
 *           example: 80
 *         height:
 *           type: number
 *           description: The height of the block
 *           example: 80
 *         items:
 *           type: array
 *           description: A list of all the items in the block, if a resource or project block
 *           items:
 *             type: string
 *             description: The ID of one of the items in the block
 *             example: abcdefg1234
 *       xml:
 *         name: blockupdaterequest
 *     BlockResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID of the block
 *           example: abcdef1234
 *         workspaceId:
 *           type: string
 *           description: ID of the workspace that the block belongs to
 *           example: abcdef1234
 *         type:
 *           type: string
 *           description: The type of block
 *           example: resource
 *         x:
 *           type: number
 *           description: The x position of the block
 *           example: 0
 *         y:
 *           type: number
 *           description: The y position of the block
 *           example: 0
 *         width:
 *           type: number
 *           description: The width of the block
 *           example: 80
 *         height:
 *           type: number
 *           description: The height of the block
 *           example: 80
 *         items:
 *           type: array
 *           description: A list of all the items in the block, if a resource or project block
 *           items:
 *             type: string
 *             description: The ID of one of the items in the block
 *             example: abcdefg1234
 *         resources:
 *           type: array
 *           description: The resources in the block, if a resource block
 *           items:
 *             $ref: '#/components/schemas/ResourceResponse'
 *         projects:
 *           type: array
 *           description: The projects in the block, if a project block
 *           items:
 *             $ref: '#/components/schemas/ProjectResponse'
 *         stickyText:
 *           type: string
 *           description: The sticky note text in the block, if a sticky note block
 *           example: This is a sticky note
 *       xml:
 *         name: blockresponse
 */

/**
 * @swagger
 * /blocks:
 *   post:
 *     tags:
 *       - blocks
 *     summary: Create a workspace block for a user
 *     operationId: createBlock
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BlockRequest'
 *       required: true
 *     responses:
 *       '201':
 *         description: Successfully created block
 *       '401':
 *         description: Not logged in
 *       '500':
 *         description: Internal server error
 */
router.post("", (async (req, res, next) => {
  try {
    const block = await createBlock(
      req.body.workspaceId,
      req.session?.userId,
      req.body.type,
      req.body.x,
      req.body.y,
      req.body.width,
      req.body.height
    );
    // Add size of created document to user's storage.
    await updateUserStorage(req.session?.userId, bsonSize(block));
    res.status(201).end();
  } catch (err) {
    next(createError(500, err));
  }
}) as RequestHandler);

/**
 * @swagger
 * /blocks/{workspaceId}:
 *   get:
 *     tags:
 *       - blocks
 *     summary: Get all workspace blocks for a user
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the workspace that the block belongs to
 *     operationId: getBlocks
 *     responses:
 *       '200':
 *         description: Successfully retrieved all blocks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BlockResponse'
 *       '401':
 *         description: Not logged in
 *       '500':
 *         description: Internal server error
 */
router.get("/:workspaceId", (async (req, res, next) => {
  try {
    const blocks = await getBlocks(req.params.workspaceId, req.session?.userId);
    for (const block of blocks) {
      block._id = block._id.toString();
      // Ignore the __v field, which comes from mongoose.
      delete block.__v;
      // Don't expose user IDs either.
      delete block.userId;
      if (block.type === "resource") {
        block.resources = await getResources(block._id);
        // Sort into order listed in the block's items field.
        block.resources.sort((a: any, b: any) => {
          return (
            block.items.indexOf(a._id.toString()) -
            block.items.indexOf(b._id.toString())
          );
        });
        for (const resource of block.resources) {
          resource._id = resource._id.toString();
          // Ignore the __v field, which comes from mongoose.
          delete resource.__v;
        }
      } else if (block.type === "project") {
        block.projects = await getProjects(block._id);
        // Sort into order listed in the block's items field.
        block.projects.sort((a: any, b: any) => {
          return (
            block.items.indexOf(a._id.toString()) -
            block.items.indexOf(b._id.toString())
          );
        });
        for (const project of block.projects) {
          project._id = project._id.toString();
          // Ignore the __v field, which comes from mongoose.
          delete project.__v;
        }
      } else if (block.type === "sticky") {
        const stickyNote = await getStickyNote(block._id);
        if (stickyNote !== null) {
          block.stickyText = stickyNote.text;
        }
      }
    }
    res.status(200).send(blocks);
  } catch (err) {
    next(createError(500, err));
  }
}) as RequestHandler);

/**
 * @swagger
 * /blocks/{blockId}:
 *   patch:
 *     tags:
 *       - blocks
 *     summary: Update a workspace block for a user
 *     operationId: updateBlock
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BlockUpdateRequest'
 *       required: true
 *     responses:
 *       '201':
 *         description: Successfully updated block
 *       '401':
 *         description: Not logged in
 *       '500':
 *         description: Internal server error
 */
router.patch("/:blockId", (async (req, res, next) => {
  try {
    const oldBlock = await getBlock(req.params.blockId);
    const newBlock = await updateBlock(
      req.params.blockId,
      req.body.x,
      req.body.y,
      req.body.width,
      req.body.height,
      req.body.items
    );
    // Update user's storage based on the change in document size after updating a block.
    await updateUserStorage(
      req.session?.userId,
      bsonSize(newBlock) - bsonSize(oldBlock)
    );
    res.status(204).end();
  } catch (err) {
    next(createError(500, err));
  }
}) as RequestHandler);

/**
 * @swagger
 * /blocks/{blockId}:
 *   delete:
 *     tags:
 *       - blocks
 *     summary: Delete a workspace block
 *     parameters:
 *       - in: path
 *         name: blockId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the block to delete
 *     operationId: deleteBlock
 *     responses:
 *       '204':
 *         description: Successfully deleted block
 *       '401':
 *         description: Not logged in
 *       '500':
 *         description: Internal server error
 */
router.delete("/:blockId", (async (req, res, next) => {
  try {
    const block = await deleteBlock(req.params.blockId);
    // Delete all elements within the block.
    const stickyNotes = await deleteStickyNotes(req.params.blockId);
    const resources = await deleteResources(req.params.blockId);
    const projects = await deleteProjects(req.params.blockId);
    // Deleted any associated images.
    let deletedImagesSize = 0;
    for (const resource of resources) {
      if (resource.imageId !== undefined) {
        const imageId = new mongoose.Types.ObjectId(resource.imageId);
        const image = await bucket.find(imageId).next();
        deletedImagesSize += image != null ? image.length : 0;
        await bucket.delete(imageId);
      }
    }
    for (const project of projects) {
      if (project.imageId !== undefined) {
        const imageId = new mongoose.Types.ObjectId(project.imageId);
        const image = await bucket.find(imageId).next();
        deletedImagesSize += image != null ? image.length : 0;
        await bucket.delete(imageId);
      }
    }

    // Subtract size of deleted documents from user's storage.
    await updateUserStorage(
      req.session?.userId,
      -(
        bsonSize(block) +
        bsonSize(stickyNotes) +
        bsonSize(resources) +
        bsonSize(projects) +
        deletedImagesSize
      )
    );
    res.status(204).end();
  } catch (err) {
    next(createError(500, err));
  }
}) as RequestHandler);

module.exports = router;
