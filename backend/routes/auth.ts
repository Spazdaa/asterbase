/**
 * Endpoints related to authentication and session management.
 */

import express, {
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response,
} from "express";
import { ObjectId } from "mongodb";

import { createUser, getUser, getUsers, updateUserStorage } from "../db/auth";
import { getBlocks } from "../db/blocks";
import { bucket } from "../db/db";
import { getProjects } from "../db/projects";
import { getResources } from "../db/resources";
import { getStickyNote } from "../db/stickyNotes";
import { createWorkspace, getWorkspaces } from "../db/workspaces";
import { bsonSize, verify } from "../utils";
const createError = require("http-errors");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: auth
 *     description: Authentication endpoints
 *
 * components:
 *   schemas:
 *     AuthRequest:
 *       type: object
 *       properties:
 *         credential:
 *           type: string
 *           description: Credential value provided by Google OAuth2
 *           example: abcdef1234
 *       xml:
 *         name: authrequest
 *     LoginResponse:
 *       type: object
 *       properties:
 *         subscriptionStatus:
 *           type: string
 *           description: Whether the user has an active subscription
 *           example: "active"
 *       xml:
 *         name: loginresponse
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID of the user
 *           example: "123456"
 *         email:
 *           type: string
 *           description: User email
 *           example: "user@gmail.com"
 *         name:
 *           type: string
 *           description: Name of user
 *           example: "Dohn Joe"
 *         birthdate:
 *           type: string
 *           description: DOB of user
 *           example: "2023-07-01"
 *         storage:
 *           type: number
 *           description: Amount of storage used by the user
 *           example: 10
 *         skills:
 *           type: array
 *           description: A list of user skills
 *           items:
 *             type: string
 *             description: The ID of the skill
 *             example: abcdefg1234
 *         guntherSessions:
 *           type: number
 *           description: Number of available sessions for Gunther AI
 *           example: 10
 *         guntherEnabled:
 *           type: boolean
 *           description: Whether the user can use Gunther AI
 *           example: true
 *       xml:
 *         name: user
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - auth
 *     summary: Log in and create a user session
 *     description: Uses Google OAuth2
 *     operationId: login
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthRequest'
 *       required: true
 *     responses:
 *       '201':
 *         description: Successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       '400':
 *         description: Unable to verify credential
 *       '500':
 *         description: Internal server error
 */
router.post("/login", (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = await verify(req);

    if (payload == null) {
      next(createError(400, "Unable to verify credential"));
    }

    let subscriptionStatus = "inactive";
    const users = await getUser(payload.sub);
    if (users.length === 0) {
      // Create the user if they don't exist.
      await createUser(
        payload.sub,
        payload.email,
        payload.firstName,
        payload.lastName,
        payload.birthdate,
        0,
        [],
        0,
        false
      );
      // Create a workspace for them. For now, give it a default name since user's will only have one.
      const workspace = await createWorkspace(payload.sub, "Workspace 1");
      // Add size of created document to user's storage.
      await updateUserStorage(payload.sub, bsonSize(workspace));
    } else {
      // Check if the user has an active subscription.
      if (users[0].subscriptionExpiry > Date.now()) {
        subscriptionStatus = "active";
      }
    }

    // Store the user ID and subscription status in the session.
    req.session = {
      userId: payload.sub,
      subscriptionStatus,
    };
    res.status(201).send({ subscriptionStatus });
  } catch (err) {
    next(createError(500, err));
  }
}) as RequestHandler);

/**
 * @swagger
 * /auth/verify:
 *   post:
 *     tags:
 *       - auth
 *     summary: Check if a user is already logged in.
 *     operationId: verify
 *     responses:
 *       '200':
 *         description: Successfully verified login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       '401':
 *         description: Not logged in
 *       '500':
 *         description: Internal server error
 */
router.post("/verify", (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!(req.session?.isPopulated ?? false)) {
      res.status(401).end();
      return;
    }

    let subscriptionStatus = null;
    const users = await getUser(req.session?.userId);
    if (users.length === 0) {
      res.status(401).end();
      return;
    } else {
      // Check if the user has an active subscription.
      if (users[0].subscriptionExpiry > Date.now()) {
        subscriptionStatus = "active";
      } else {
        subscriptionStatus = "inactive";
      }
    }

    // Reset the session with an updated subscription status, if applicable.
    req.session = {
      userId: req.session?.userId,
      subscriptionStatus,
    };
    res.status(200).send({ subscriptionStatus });
  } catch (err) {
    next(createError(500, err));
  }
}) as RequestHandler);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags:
 *       - auth
 *     summary: Log out of the user session
 *     operationId: logout
 *     responses:
 *       '204':
 *         description: Successfully logged out
 *       '500':
 *         description: Internal server error
 */
router.post("/logout", (req: Request, res: Response) => {
  req.session = null;
  res.status(204).end();
});

/**
 * @swagger
 * /auth/verifyStorage:
 *   post:
 *     tags:
 *       - auth
 *     summary: Ensure the used storage for all users is accurate.
 *     operationId: verifyStorage
 *     responses:
 *       '204':
 *         description: Successfully verified storage
 *       '500':
 *         description: Internal server error
 */
router.post("/verifyStorage", (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await getUsers();
    for (const user of users) {
      // Calculate total storage used by a user.
      let totalStorage = 0;
      const workspaces = await getWorkspaces(user._id);
      totalStorage += bsonSize(workspaces);
      for (const workspace of workspaces) {
        const blocks = await getBlocks(workspace._id, user._id);
        totalStorage += bsonSize(blocks);
        for (const block of blocks) {
          if (block.type === "sticky") {
            const stickyNote = await getStickyNote(block._id);
            totalStorage += bsonSize(stickyNote);
          } else if (block.type === "resource") {
            const resources = await getResources(block._id);
            totalStorage += bsonSize(resources);
            for (const resource of resources) {
              const image = await bucket
                .find({ _id: new ObjectId(resource.imageId) })
                .next();
              totalStorage += image != null ? image.length : 0;
            }
          } else if (block.type === "project") {
            const projects = await getProjects(block._id);
            totalStorage += bsonSize(projects);
            for (const project of projects) {
              const image = await bucket
                .find({ _id: new ObjectId(project.imageId) })
                .next();
              totalStorage += image != null ? image.length : 0;
            }
          }
        }
      }

      // Update the user's storage if it's inaccurate.
      const users = await getUser(user._id);
      if (totalStorage !== users[0].storage) {
        await updateUserStorage(user._id, totalStorage - users[0].storage);
      }
    }
    res.status(204).end();
  } catch (err) {
    next(createError(500, err));
  }
}) as RequestHandler);

/**
 * @swagger
 * /auth/user:
 *   get:
 *     tags:
 *       - auth
 *     summary: Get the user's information
 *     operationId: getUser
 *     responses:
 *       '200':
 *         description: Successfully retrieved user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '500':
 *         description: Internal server error
 */
router.get("/user", (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await getUser(req.session?.userId);
    res.status(200).send(users[0]);
  } catch (err) {
    next(createError(500, err));
  }
}) as RequestHandler);

module.exports = router;
