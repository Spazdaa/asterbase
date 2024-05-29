/** Integration tests for skill endpoints using an in-memory MongoDB testing database. */

import { type NextFunction } from "express";
import { type Db, type Document, MongoClient, ObjectId } from "mongodb";
import request from "supertest";

import { close } from "../../db/db";
import { storage } from "../../utils";

const app = require("../../app");
// Use mock-session to set the express-cookie session middleware.
const mockSession = require("mock-session");

// Skip authentication middleware.
jest.mock("../../utils", () => {
  const originalModule = jest.requireActual("../../utils");
  return {
    __esModule: true,
    ...originalModule,
    checkAuthHandler: jest.fn(
      (req: Request, res: Response, next: NextFunction): void => {
        next();
      }
    ),
    checkSubscriptionHandler: jest.fn(
      (req: Request, res: Response, next: NextFunction): void => {
        next();
      }
    ),
  };
});

// Tests.
describe("Skills", () => {
  let connection: MongoClient;
  let db: Db;

  beforeAll(async () => {
    if (process.env.MONGO_URL == null) {
      throw new Error("MongoDB URL not found");
    }
    connection = await MongoClient.connect(process.env.MONGO_URL);
    db = connection.db("testdb");
    process.env.MONGO_URL = process.env.MONGO_URL.concat("testdb");
  });

  afterAll(async () => {
    await connection.close();
    // Manually close the API's database connection. Typically it stays open forever.
    await close();
    // Manually close the client connection created by the GridFS storage.
    const { client } = await storage.ready();
    await client.close();
  });

  it("creates a skill", async () => {
    const res = await request(app)
      .post("/skills")
      .field("name", "skillName")
      .field("bgColour", "bg-red-300")
      .field("textColour", "text-red-400")
      .attach("skill-image", "tests/mockData/testImage.png");
    expect(res.status).toBe(201);

    const skills = await db.collection("skills").find().toArray();
    expect(skills.length).toBe(1);
    expect(skills[0].name).toBe("skillName");
    expect(skills[0].bgColour).toBe("bg-red-300");
    expect(skills[0].textColour).toBe("text-red-400");
    expect(skills[0].imageId).toBeDefined();

    await db.collection("skills").deleteMany();
    await db.collection("asterspark-images.files").deleteMany();
    await db.collection("asterspark-images.chunks").deleteMany();
  });

  it("gets skills", async () => {
    const skillId = (
      await db.collection("skills").insertOne({
        name: "skillName",
        bgColour: "bg-red-300",
        textColour: "text-red-400",
        imageId: "skillImageId",
      })
    ).insertedId.toString();

    const res = await request(app).get("/skills");
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0]).toEqual({
      _id: skillId,
      name: "skillName",
      bgColour: "bg-red-300",
      textColour: "text-red-400",
      imageId: "skillImageId",
    });

    await db.collection("skills").deleteMany();
  });

  it("gets skill image", async () => {
    const imageId = (
      await db.collection("asterspark-images.files").insertOne({
        length: "312658",
        chunkSize: "261120",
        uploadDate: "2023-06-08T17:30:03.110+00:00",
        filename: "imageName",
        contentType: "image/jpeg",
      })
    ).insertedId.toString();

    const res = await request(app).get(`/skills/images/${imageId}`);
    expect(res.status).toBe(200);

    await db.collection("asterspark-images.files").deleteMany();
  });

  it("updates a skill", async () => {
    const skillId = (
      await db.collection("skills").insertOne({
        name: "skillName",
        bgColour: "bg-red-300",
        textColour: "text-red-400",
        imageId: "skillImageId",
      })
    ).insertedId.toString();

    const res = await request(app).patch(`/skills/${skillId}`).send({
      name: "newSkillName",
    });

    expect(res.status).toBe(204);
    const skills = await db.collection("skills").find().toArray();
    expect(skills.length).toBe(1);
    expect(skills[0]).toEqual({
      _id: new ObjectId(skillId),
      name: "newSkillName",
      bgColour: "bg-red-300",
      textColour: "text-red-400",
      imageId: "skillImageId",
    });

    await db.collection("skills").deleteMany();
  });

  it("deletes a skill", async () => {
    const skillId = (
      await db.collection("skills").insertOne({
        name: "skillName",
      })
    ).insertedId.toString();

    const res = await request(app).delete(`/skills/${skillId}`);

    expect(res.status).toBe(204);
    const skills = await db.collection("skills").find().toArray();
    expect(skills.length).toBe(0);
  });

  it("adds a skill to a user", async () => {
    await db.collection<{ _id: string } & Document>("users").insertOne({
      _id: "userId",
      storage: 0,
    });
    const cookie = mockSession("session", process.env.SESSION_SECRET, {
      userId: "userId",
    });
    const skillId = (
      await db.collection("skills").insertOne({
        name: "skillName",
      })
    ).insertedId.toString();

    const res = await request(app)
      .post(`/skills/users/${skillId}`)
      .set("Cookie", [cookie]);

    expect(res.status).toBe(204);
    const user = await db
      .collection<{ _id: string } & Document>("users")
      .findOne({ _id: "userId" });
    expect(user?.skills.length).toBe(1);
    expect(user?.skills[0]).toBe(skillId);
    // Check that skill count was incremented.
    const skill = await db
      .collection("skills")
      .findOne({ _id: new ObjectId(skillId) });
    expect(skill?.count).toBe(1);

    await db.collection("users").deleteMany();
    await db.collection("skills").deleteMany();
  });

  it("gets a user's skills", async () => {
    await db.collection<{ _id: string } & Document>("users").insertOne({
      _id: "userId",
      storage: 0,
      skills: ["skillId"],
    });
    const cookie = mockSession("session", process.env.SESSION_SECRET, {
      userId: "userId",
    });

    const res = await request(app).get(`/skills/users`).set("Cookie", [cookie]);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0]).toEqual("skillId");

    await db.collection("users").deleteMany();
  });

  it("removes a skill from a user", async () => {
    const cookie = mockSession("session", process.env.SESSION_SECRET, {
      userId: "userId",
    });
    const skillId = (
      await db.collection("skills").insertOne({
        name: "skillName",
        count: 1,
      })
    ).insertedId.toString();
    await db.collection<{ _id: string } & Document>("users").insertOne({
      _id: "userId",
      storage: 0,
      skills: [skillId],
    });

    const res = await request(app)
      .delete(`/skills/users/${skillId}`)
      .set("Cookie", [cookie]);
    expect(res.status).toBe(204);
    const user = await db
      .collection<{ _id: string } & Document>("users")
      .findOne({ _id: "userId" });
    expect(user?.skills.length).toBe(0);
    // Check that skill count was decremented.
    const skill = await db
      .collection("skills")
      .findOne({ _id: new ObjectId(skillId) });
    expect(skill?.count).toBe(0);

    await db.collection("users").deleteMany();
    await db.collection("skills").deleteMany();
  });

  it("properly manages user storage", async () => {
    await db.collection<{ _id: string } & Document>("users").insertOne({
      _id: "userId",
      storage: 0,
      skills: [],
    });
    const cookie = mockSession("session", process.env.SESSION_SECRET, {
      userId: "userId",
    });
    const skillId = (
      await db.collection("skills").insertOne({
        name: "skillName",
      })
    ).insertedId.toString();

    // Add a skill to a user.
    await request(app).post(`/skills/users/${skillId}`).set("Cookie", [cookie]);
    let user = await db
      .collection<{ _id: string } & Document>("users")
      .findOne({ _id: "userId" });
    expect(user?.storage).toBeGreaterThan(0);

    // Remove the skill from the user.
    await request(app)
      .delete(`/skills/users/${skillId}`)
      .set("Cookie", [cookie]);
    user = await db
      .collection<{ _id: string } & Document>("users")
      .findOne({ _id: "userId" });
    expect(user?.storage).toBe(0);

    await db.collection("users").deleteMany();
    await db.collection("skills").deleteMany();
  });

  it("gets the count for a skill", async () => {
    const skillId = (
      await db.collection("skills").insertOne({
        name: "skillName",
        count: 10,
      })
    ).insertedId.toString();

    const res = await request(app).get("/skills/count");

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0]).toEqual({
      _id: skillId,
      name: "skillName",
      count: 10,
    });

    await db.collection("skills").deleteMany();
  });
});
