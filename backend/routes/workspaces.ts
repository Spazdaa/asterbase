/**
 * Endpoints related to workspaces.
 */

import express, { type RequestHandler } from "express";

import { updateUserStorage } from "../db/auth";
import { createWorkspace, getWorkspaces } from "../db/workspaces";
import { bsonSize } from "../utils";
const createError = require("http-errors");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: workspaces
 *     description: Workspace endpoints
 *
 * components:
 *   schemas:
 *     WorkspaceRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the workspace
 *           example: Workspace 1
 *       xml:
 *         name: workspacerequest
 *     WorkspaceResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID of the workspace
 *           example: abcdef1234
 *         userId:
 *           type: string
 *           description: ID of the user that owns the workspace
 *           example: abcdef1234
 *         name:
 *           type: string
 *           description: name of the workspace
 *           example: Workspace 1
 *       xml:
 *         name: workspaceresponse
 */

/**
 * @swagger
 * /workspaces:
 *   post:
 *     tags:
 *       - workspaces
 *     summary: Create a workspace
 *     operationId: createWorkspace
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorkspaceRequest'
 *       required: true
 *     responses:
 *       '201':
 *         description: Successfully created workspace
 *       '401':
 *         description: Not logged in
 *       '500':
 *         description: Internal server error
 */
router.post("", (async (req, res, next) => {
  try {
    const workspace = await createWorkspace(req.session?.userId, req.body.name);
    // Add size of created document to user's storage.
    await updateUserStorage(req.session?.userId, bsonSize(workspace));
    res.status(201).end();
  } catch (err) {
    next(createError(500, err));
  }
}) as RequestHandler);

/**
 * @swagger
 * /workspaces:
 *   get:
 *     tags:
 *       - workspaces
 *     summary: Get all workspaces for a user
 *     operationId: getWorkspaces
 *     responses:
 *       '200':
 *         description: Successfully retrieved all workspaces
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WorkspaceResponse'
 *       '401':
 *         description: Not logged in
 *       '500':
 *         description: Internal server error
 */
router.get("", (async (req, res, next) => {
  try {
    const workspaces = await getWorkspaces(req.session?.userId);
    for (const workspace of workspaces) {
      workspace._id = workspace._id.toString();
      // Ignore the __v field, which comes from mongoose.
      delete workspace.__v;
    }
    res.status(200).send(workspaces);
  } catch (err) {
    next(createError(500, err));
  }
}) as RequestHandler);

module.exports = router;
