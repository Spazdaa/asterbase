/**
 * Endpoints related to skills.
 */

import express, { type RequestHandler } from "express";
import mongoose from "mongoose";

import { getUser, updateUserStorage } from "../db/auth";
import { bucket } from "../db/db";
import {
  addUserSkill,
  createSkill,
  deleteSkill,
  deleteUserSkill,
  getSkill,
  getSkills,
  updateSkill,
  updateSkillCount,
} from "../db/skills";
import { bsonSize, imageUpload } from "../utils";
const createError = require("http-errors");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: skills
 *     description: Skill endpoints
 *
 * components:
 *   schemas:
 *     SkillRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the skill
 *           example: Skill 1
 *         bgColour:
 *           type: string
 *           description: The tailwind classname for the background colour of the skill block
 *           example: bg-gray-50
 *         textColour:
 *           type: string
 *           description: The tailwind classname for the text colour of the skill block
 *           example: text-gray-50
 *         skill-image:
 *           type: string
 *           format: binary
 *           description: An image representing the skill
 *       xml:
 *         name: skillrequest
 *     SkillUpdateRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the skill
 *           example: Skill 1
 *         bgColour:
 *           type: string
 *           description: The tailwind classname for the background colour of the skill block
 *           example: bg-gray-50
 *         textColour:
 *           type: string
 *           description: The tailwind classname for the text colour of the skill block
 *           example: text-gray-50
 *         skill-image:
 *           type: string
 *           format: binary
 *           description: An image representing the skill
 *       xml:
 *         name: skillupdaterequest
 *     SkillResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID of the skill
 *           example: abcdef1234
 *         name:
 *           type: string
 *           description: The name of the skill
 *           example: Skill 1
 *         count:
 *           type: number
 *           description: The number of occurrences of the skill
 *           example: 10
 *         bgColour:
 *           type: string
 *           description: The tailwind classname for the background colour of the skill block
 *           example: bg-gray-50
 *         textColour:
 *           type: string
 *           description: The tailwind classname for the text colour of the skill block
 *           example: text-gray-50
 *         imageId:
 *           type: string
 *           description: The ID of an image representing the skill
 *           example: abcdefg1234
 *       xml:
 *         name: skillrequest
 *     SkillCount:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID of the skill
 *           example: abcdef1234
 *         name:
 *           type: string
 *           description: The name of the skill
 *           example: Skill 1
 *         count:
 *           type: number
 *           description: The number of occurrences of the skill
 *           example: 10
 *       xml:
 *         name: skillcount
 */

/**
 * @swagger
 * /skills:
 *   post:
 *     tags:
 *       - skills
 *     summary: Create a skill
 *     operationId: createSkill
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/SkillRequest'
 *       required: true
 *     responses:
 *       '201':
 *         description: Successfully created skill
 *       '401':
 *         description: Not logged in
 *       '500':
 *         description: Internal server error
 */
router.post("", imageUpload.single("skill-image"), (async (req, res, next) => {
  try {
    await createSkill(
      req.body.name,
      req.body.bgColour,
      req.body.textColour,
      req.file?.id
    );
    res.status(201).end();
  } catch (err) {
    next(createError(500, err));
  }
}) as RequestHandler);

/**
 * @swagger
 * /skills:
 *   get:
 *     tags:
 *       - skills
 *     summary: Get all skills
 *     operationId: getSkills
 *     responses:
 *       '200':
 *         description: Successfully retrieved all skills
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SkillResponse'
 *       '401':
 *         description: Not logged in
 *       '500':
 *         description: Internal server error
 */
router.get("", (async (req, res, next) => {
  try {
    const skills = await getSkills();
    for (const skill of skills) {
      skill._id = skill._id.toString();
      // Ignore the __v field, which comes from mongoose.
      delete skill.__v;
    }
    res.status(200).send(skills);
  } catch (err) {
    next(createError(500, err));
  }
}) as RequestHandler);

/**
 * @swagger
 * /skills/images/{imageId}:
 *   get:
 *     tags:
 *       - skills
 *     summary: Get a skill image
 *     parameters:
 *       - in: path
 *         name: imageId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the image to retrieve
 *     operationId: getSkillImage
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
 * /skills/{skillId}:
 *   patch:
 *     tags:
 *       - skills
 *     summary: Update a skill
 *     parameters:
 *       - in: path
 *         name: skillId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the skill to update
 *     operationId: updateSkill
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/SkillUpdateRequest'
 *       required: true
 *     responses:
 *       '204':
 *         description: Successfully updated skill
 *       '401':
 *         description: Not logged in
 *       '500':
 *         description: Internal server error
 */
router.patch("/:skillId", imageUpload.single("skill-image"), (async (
  req,
  res,
  next
) => {
  try {
    // Get current skill image ID.
    const oldSkill = await getSkill(req.params.skillId);
    await updateSkill(
      req.params.skillId,
      req.body.name,
      req.body.bgColour,
      req.body.textColour,
      req.file?.id
    );

    // Delete previous skill image if it has been changed.
    if (req.file?.id !== undefined && oldSkill.imageId !== undefined) {
      const oldImageId = new mongoose.Types.ObjectId(oldSkill.imageId);
      await bucket.delete(oldImageId);
    }

    res.status(204).end();
  } catch (err) {
    next(createError(500, err));
  }
}) as RequestHandler);

/**
 * @swagger
 * /skills/{skillId}:
 *   delete:
 *     tags:
 *       - skills
 *     summary: Delete a skill
 *     parameters:
 *       - in: path
 *         name: skillId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the skill to delete
 *     operationId: deleteSkill
 *     responses:
 *       '204':
 *         description: Successfully deleted skill
 *       '401':
 *         description: Not logged in
 *       '500':
 *         description: Internal server error
 */
router.delete("/:skillId", (async (req, res, next) => {
  try {
    // Get current skill image ID.
    const skill = await getSkill(req.params.skillId);
    await deleteSkill(req.params.skillId);
    // Delete skill image if it exists.
    if (skill.imageId !== undefined) {
      const imageId = new mongoose.Types.ObjectId(skill.imageId);
      await bucket.delete(imageId);
    }

    res.status(204).end();
  } catch (err) {
    next(createError(500, err));
  }
}) as RequestHandler);

/**
 * @swagger
 * /skills/users/{skillId}:
 *   post:
 *     tags:
 *       - skills
 *     summary: Add a skill to a user
 *     parameters:
 *       - in: path
 *         name: skillId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the skill to add
 *     operationId: addUserSkill
 *     responses:
 *       '204':
 *         description: Successfully added user skill
 *       '401':
 *         description: Not logged in
 *       '500':
 *         description: Internal server error
 */
router.post("/users/:skillId", (async (req, res, next) => {
  try {
    const oldUser = await getUser(req.session?.userId);
    const newUser = await addUserSkill(req.session?.userId, req.params.skillId);

    // Update size of user data.
    await updateUserStorage(
      req.session?.userId,
      bsonSize(newUser) - bsonSize(oldUser)
    );

    // Increment global skill count.
    await updateSkillCount(req.params.skillId, 1);

    res.status(204).end();
  } catch (err) {
    next(createError(500, err));
  }
}) as RequestHandler);

/**
 * @swagger
 * /skills/users:
 *   post:
 *     tags:
 *       - skills
 *     summary: Get skills for a user
 *     operationId: getUserSkills
 *     responses:
 *       '200':
 *         description: Successfully retrieved all user skills
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *                 description: ID of the skill
 *                 example: abcdef1234
 *       '401':
 *         description: Not logged in
 *       '500':
 *         description: Internal server error
 */
router.get("/users", (async (req, res, next) => {
  try {
    const user = (await getUser(req.session?.userId))[0];
    const skills = user.skills !== undefined ? user.skills : [];

    res.status(200).send(skills);
  } catch (err) {
    next(createError(500, err));
  }
}) as RequestHandler);

/**
 * @swagger
 * /skills/users/{skillId}:
 *   delete:
 *     tags:
 *       - skills
 *     summary: Remove a skill from a user
 *     parameters:
 *       - in: path
 *         name: skillId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the skill to remove
 *     operationId: deleteUserSkill
 *     responses:
 *       '204':
 *         description: Successfully removed user skill
 *       '401':
 *         description: Not logged in
 *       '500':
 *         description: Internal server error
 */
router.delete("/users/:skillId", (async (req, res, next) => {
  try {
    const oldUser = await getUser(req.session?.userId);
    const newUser = await deleteUserSkill(
      req.session?.userId,
      req.params.skillId
    );

    // Update size of user data.
    await updateUserStorage(
      req.session?.userId,
      -(bsonSize(oldUser) - bsonSize(newUser))
    );

    // Decrement global skill count.
    await updateSkillCount(req.params.skillId, -1);

    res.status(204).end();
  } catch (err) {
    next(createError(500, err));
  }
}) as RequestHandler);

/**
 * @swagger
 * /skills/count:
 *   get:
 *     tags:
 *       - skills
 *     summary: Get the count of each skill
 *     operationId: getSkillCounts
 *     responses:
 *       '200':
 *         description: Successfully retrieved all skill counts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SkillCount'
 *       '401':
 *         description: Not logged in
 *       '500':
 *         description: Internal server error
 */
router.get("/count", (async (req, res, next) => {
  try {
    const skills = await getSkills();
    const sortedSkills = skills
      .map((skill: any) => {
        return { _id: skill._id, name: skill.name, count: skill.count };
      })
      .sort((a: any, b: any) => {
        return b.count - a.count;
      });

    res.status(200).send(sortedSkills);
  } catch (err) {
    next(createError(500, err));
  }
}) as RequestHandler);

module.exports = router;
