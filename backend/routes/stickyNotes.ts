/**
 * Endpoints related to sticky notes used in workspace blocks.
 */

import express, { type RequestHandler } from "express";

import { updateUserStorage } from "../db/auth";
import {
  createStickyNote,
  deleteStickyNote,
  getStickyNote,
  updateStickyNote,
} from "../db/stickyNotes";
import { bsonSize } from "../utils";
const createError = require("http-errors");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: stickyNotes
 *     description: Sticky note endpoints
 *
 * components:
 *   schemas:
 *     StickyNoteRequest:
 *       type: object
 *       properties:
 *         blockId:
 *           type: string
 *           description: ID of the block that the sticky note belongs to
 *           example: abcdef1234
 *         text:
 *           type: string
 *           description: The content of the sticky note
 *           example: This is a sticky note
 *       xml:
 *         name: stickynoterequest
 *     StickyNoteUpdateRequest:
 *       type: object
 *       properties:
 *         text:
 *           type: string
 *           description: The content of the sticky note
 *           example: This is a sticky note
 *       xml:
 *         name: stickynoteupdaterequest
 *     StickyNoteResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID of the sticky note
 *           example: abcdef1234
 *         blockId:
 *           type: string
 *           description: ID of the block that the sticky note belongs to
 *           example: abcdef1234
 *         text:
 *           type: string
 *           description: The content of the sticky note
 *           example: This is a sticky note
 *       xml:
 *         name: stickynoterequest
 */

/**
 * @swagger
 * /stickyNotes:
 *   post:
 *     tags:
 *       - stickyNotes
 *     summary: Create a sticky note
 *     description: Create a sticky note to be used in a workspace block
 *     operationId: createStickyNote
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StickyNoteRequest'
 *       required: true
 *     responses:
 *       '201':
 *         description: Successfully created sticky note
 *       '401':
 *         description: Not logged in
 *       '500':
 *         description: Internal server error
 */
router.post("", (async (req, res, next) => {
  try {
    const stickyNote = await createStickyNote(req.body.blockId, req.body.text);
    // Add size of created document to user's storage.
    await updateUserStorage(req.session?.userId, bsonSize(stickyNote));
    res.status(201).end();
  } catch (err) {
    next(createError(500, err));
  }
}) as RequestHandler);

/**
 * @swagger
 * /stickyNotes/{blockId}:
 *   get:
 *     tags:
 *       - stickyNotes
 *     summary: Get all sticky notes
 *     description: Get all sticky notes that are used in a workspace block
 *     parameters:
 *       - in: path
 *         name: blockId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the block that the sticky note belongs to
 *     operationId: getStickyNotes
 *     responses:
 *       '200':
 *         description: Successfully retrieved all sticky notes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StickyNoteResponse'
 *       '401':
 *         description: Not logged in
 *       '500':
 *         description: Internal server error
 */
router.get("/:blockId", (async (req, res, next) => {
  try {
    const stickyNote = await getStickyNote(req.params.blockId);
    if (stickyNote !== null) {
      stickyNote._id = stickyNote._id.toString();
      // Ignore the __v field, which comes from mongoose.
      delete stickyNote.__v;
    }
    res.status(200).send(stickyNote);
  } catch (err) {
    next(createError(500, err));
  }
}) as RequestHandler);

/**
 * @swagger
 * /stickyNotes/{stickyNoteId}:
 *   patch:
 *     tags:
 *       - stickyNotes
 *     summary: Update a sticky note
 *     description: Update a sticky note used in a workspace block
 *     parameters:
 *       - in: path
 *         name: stickyNoteId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the sticky note to update. For sticky notes, this is the same value as the block ID.
 *     operationId: updateStickyNote
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StickyNoteUpdateRequest'
 *       required: true
 *     responses:
 *       '204':
 *         description: Successfully updated sticky note
 *       '401':
 *         description: Not logged in
 *       '500':
 *         description: Internal server error
 */
router.patch("/:stickyNoteId", (async (req, res, next) => {
  try {
    const oldStickyNote = await getStickyNote(req.params.stickyNoteId);
    const newStickyNote = await updateStickyNote(
      req.params.stickyNoteId,
      req.body.text
    );
    // Update user's storage with difference in size after updating sticky note.
    await updateUserStorage(
      req.session?.userId,
      bsonSize(newStickyNote) - bsonSize(oldStickyNote)
    );
    res.status(204).end();
  } catch (err) {
    next(createError(500, err));
  }
}) as RequestHandler);

/**
 * @swagger
 * /stickyNotes/{stickyNoteId}:
 *   delete:
 *     tags:
 *       - stickyNotes
 *     summary: Delete a sticky note
 *     description: Delete a sticky note from a workspace block
 *     parameters:
 *       - in: path
 *         name: stickyNoteId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the sticky note to delete
 *     operationId: deleteStickyNote
 *     responses:
 *       '204':
 *         description: Successfully deleted sticky note
 *       '401':
 *         description: Not logged in
 *       '500':
 *         description: Internal server error
 */
router.delete("/:stickyNoteId", (async (req, res, next) => {
  try {
    const stickyNote = await deleteStickyNote(req.params.stickyNoteId);
    // Subtract size of deleted document from user's storage.
    await updateUserStorage(req.session?.userId, -bsonSize(stickyNote));
    res.status(204).end();
  } catch (err) {
    next(createError(500, err));
  }
}) as RequestHandler);

module.exports = router;
