/** Integration tests for user-related endpoints using an in-memory MongoDB testing database. */

import { type NextFunction, type Request, type Response } from "express";
import { type Db, type Document, MongoClient } from "mongodb";
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
describe("User", () => {
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

  it("verifies users' storage", async () => {
    await db.collection<{ _id: string } & Document>("users").insertOne({
      _id: "userId",
      storage: 0,
    });
    const cookie = mockSession("session", process.env.SESSION_SECRET, {
      userId: "userId",
    });

    // Create a workspace.
    await request(app).post("/workspaces").set("Cookie", [cookie]).send({
      name: "Workspace 1",
    });
    const workspaces = await db.collection("workspaces").find().toArray();
    const workspaceId = workspaces[0]._id;

    // Create a sticky note block.
    await request(app).post("/blocks").set("Cookie", [cookie]).send({
      workspaceId,
      type: "sticky",
      x: 0,
      y: 0,
      width: 80,
      height: 80,
      items: [],
    });
    let block = await db.collection("blocks").findOne({ type: "sticky" });
    let blockId = block?._id.toString();

    // Add items to the block.
    await request(app).post("/stickyNotes").set("Cookie", [cookie]).send({
      blockId,
      text: "sticky note text",
    });

    // Create a resource block.
    await request(app).post("/blocks").set("Cookie", [cookie]).send({
      workspaceId,
      type: "resource",
      x: 0,
      y: 0,
      width: 80,
      height: 80,
      items: [],
    });
    block = await db.collection("blocks").findOne({ type: "resource" });
    blockId = block?._id.toString();

    // Add items to the block.
    await request(app)
      .post("/resources")
      .set("Cookie", [cookie])
      .field("blockId", blockId ?? "")
      .field("name", "resourceName")
      .attach("resource-image", "tests/mockData/testImage.png");
    await request(app)
      .post("/resources")
      .set("Cookie", [cookie])
      .field("blockId", blockId ?? "")
      .field("name", "resourceName")
      .attach("resource-image", "tests/mockData/testImage.png");

    // Create a project block.
    await request(app).post("/blocks").set("Cookie", [cookie]).send({
      workspaceId,
      type: "project",
      x: 0,
      y: 0,
      width: 80,
      height: 80,
      items: [],
    });
    block = await db.collection("blocks").findOne({ type: "project" });
    blockId = block?._id.toString();

    // Add items to the block.
    await request(app)
      .post("/projects")
      .set("Cookie", [cookie])
      .field("blockId", blockId ?? "")
      .field("name", "projectName")
      .field("description", "projectDescription")
      .attach("project-image", "tests/mockData/testImage.png");
    await request(app)
      .post("/projects")
      .set("Cookie", [cookie])
      .field("blockId", blockId ?? "")
      .field("name", "projectName")
      .field("description", "projectDescription")
      .attach("project-image", "tests/mockData/testImage.png");

    // Increase the storage so it is inaccurate.
    let user = await db
      .collection<{ _id: string } & Document>("users")
      .findOne({ _id: "userId" });
    const storage = user?.storage;
    await db
      .collection<{ _id: string } & Document>("users")
      .updateOne({ _id: "userId" }, { $inc: { storage: 100 } });

    const res = await request(app)
      .post("/auth/verifyStorage")
      .set("Cookie", [cookie]);

    // Check that it sets it back to the correct value.
    expect(res.status).toBe(204);
    user = await db
      .collection<{ _id: string } & Document>("users")
      .findOne({ _id: "userId" });
    expect(user?.storage).toBe(storage);

    await db.collection("users").deleteMany();
    await db.collection("workspaces").deleteMany();
    await db.collection("blocks").deleteMany();
    await db.collection("projects").deleteMany();
    await db.collection("resources").deleteMany();
    await db.collection("stickynotes").deleteMany();
  });
});
