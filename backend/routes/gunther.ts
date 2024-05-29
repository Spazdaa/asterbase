/**
 * Endpoints related to Gunther AI.
 */

import express, { type RequestHandler } from "express";

import {
  decrementUserGuntherSessions,
  getUser,
  updateUserPayment,
} from "../db/auth";
import { createAICompletion } from "../utils";
const createError = require("http-errors");

const router = express.Router();

function createExplanationMessage(topic: string, explanation: string): string {
  return `You are helping me practice my knowledge about ${topic} using the Feynman technique. I am
    attempting to explain the topic to you as if you were a child: ${explanation}. Given what you
    know to be factually true about the topic, please give three distinct follow up questions that
    would be useful for my studying. Ensure the questions are based on truth, since I may have some
    misunderstandings in my explanation. Only include the questions in your response.`;
}

/**
 * @swagger
 * tags:
 *   - name: gunther
 *     description: Gunther AI endpoints
 *
 * components:
 *   schemas:
 *     followUpRequest:
 *       type: object
 *       properties:
 *         topic:
 *           type: string
 *           description: The topic being described
 *           example: Painting
 *         explanation:
 *           type: string
 *           description: The user-provided explanation of the topic
 *           example: Painting consists of applying paint to a surface
 *       xml:
 *         name: followuprequest
 *     gapsRequest:
 *       type: object
 *       properties:
 *         topic:
 *           type: string
 *           description: The topic being described
 *           example: Painting
 *         explanation:
 *           type: string
 *           description: The user-provided explanation of the topic
 *           example: Painting consists of applying paint to a surface
 *         questions:
 *           type: string
 *           description: The AI-provided follow up questions
 *           example: What is the purpose of painting?
 *         responses:
 *           type: string
 *           description: The user-provided responses to the follow up questions
 *           example: Painting is not an extreme sport
 *       xml:
 *         name: gapsrequest
 *     GuntherSessionsResponse:
 *       type: object
 *       properties:
 *         sessions:
 *           type: number
 *           description: The number of remaining sessions
 *           example: 10
 *       xml:
 *         name: gunthersessionsresponse
 */

/**
 * @swagger
 * /gunther/followUp:
 *   post:
 *     tags:
 *       - gunther
 *     summary: Submit a description and receive follow up questions
 *     operationId: followUp
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/followUpRequest'
 *       required: true
 *     responses:
 *       '200':
 *         description: Successfully created follow up questions
 *       '401':
 *         description: Not logged in
 *       '500':
 *         description: Internal server error
 */
router.post("/followUp", (async (req, res, next) => {
  try {
    // Ensure sufficient quota.
    const user = (await getUser(req.session?.userId))[0];
    if (user.guntherEnabled === undefined || user.guntherEnabled === false) {
      res.status(400).send("Insufficient gunther sessions");
      return;
    }

    // Trim input strings to 3750 characters to avoid OpenAI API limit.
    const message = createExplanationMessage(
      req.body.topic.substring(0, 3750),
      req.body.explanation.substring(0, 3750)
    );
    const completion = await createAICompletion(
      [{ role: "user", content: message }],
      700
    );
    res.status(200).send(completion);
  } catch (err) {
    next(createError(500, err));
  }
}) as RequestHandler);

/**
 * @swagger
 * /gunther/gaps:
 *   post:
 *     tags:
 *       - gunther
 *     summary: Submit information about a topic and identify gaps in understanding
 *     operationId: gaps
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/gapsRequest'
 *       required: true
 *     responses:
 *       '200':
 *         description: Successfully identified gaps in knowledge
 *       '401':
 *         description: Not logged in
 *       '500':
 *         description: Internal server error
 */
router.post("/gaps", (async (req, res, next) => {
  try {
    // Ensure sufficient quota.
    const user = (await getUser(req.session?.userId))[0];
    if (user.guntherEnabled === undefined || user.guntherEnabled === false) {
      res.status(400).send("Insufficient gunther sessions");
      return;
    }

    // Trim input strings to 3750 characters to avoid OpenAI API limit.
    const explanationMessage = createExplanationMessage(
      req.body.topic.substring(0, 3750),
      req.body.explanation.substring(0, 3750)
    );
    const followUpMessage = req.body.questions;
    const responsesMessage = req.body.responses.substring(0, 3750);
    const promptMessage = `Please identify any important concepts related to the topic that I did
      not mention, as well as any misunderstandings I have shown through my responses. Answer with
      one big list and nothing else.`;
    const completion = await createAICompletion(
      [
        { role: "user", content: explanationMessage },
        { role: "assistant", content: followUpMessage },
        { role: "user", content: responsesMessage },
        { role: "user", content: promptMessage },
      ],
      1000
    );
    res.status(200).send(completion);
  } catch (err) {
    next(createError(500, err));
  }
}) as RequestHandler);

/**
 * @swagger
 * /gunther:
 *   post:
 *     tags:
 *       - gunther
 *     summary: Start a gunther session for a user
 *     description: Send an additional request to this endpoint once at 0 quota to disable usage
 *     operationId: startGuntherSession
 *     responses:
 *       '204':
 *         description: Successfully started a gunther session
 *       '401':
 *         description: Not logged in
 *       '500':
 *         description: Internal server error
 */
router.post("", (async (req, res, next) => {
  try {
    const user = (await getUser(req.session?.userId))[0];
    if (user.guntherSessions === undefined || user.guntherSessions <= 0) {
      // Disable Gunther if the number of sessions has reached 0. Allows the user to finish their
      // last session (since we decrement the count at the start of the session).
      await updateUserPayment(
        req.session?.userId,
        undefined,
        undefined,
        undefined,
        0,
        false
      );
    } else {
      await decrementUserGuntherSessions(req.session?.userId);
    }
    res.status(204).end();
  } catch (err) {
    next(createError(500, err));
  }
}) as RequestHandler);

/**
 * @swagger
 * /gunther:
 *   get:
 *     tags:
 *       - gunther
 *     summary: Get the number of gunther sessions remaining for a user
 *     operationId: getGuntherSessions
 *     responses:
 *       '200':
 *         description: Successfully fetched the number of gunther sessions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GuntherSessionsResponse'
 *       '401':
 *         description: Not logged in
 *       '500':
 *         description: Internal server error
 */
router.get("", (async (req, res, next) => {
  try {
    const user = (await getUser(req.session?.userId))[0];
    res.status(200).send({
      sessions: user.guntherSessions === undefined ? 0 : user.guntherSessions,
    });
  } catch (err) {
    next(createError(500, err));
  }
}) as RequestHandler);

module.exports = router;
