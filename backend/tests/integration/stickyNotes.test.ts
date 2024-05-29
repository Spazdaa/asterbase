/** Integration tests for sticky note endpoints using an in-memory MongoDB testing database. */

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
describe("Sticky notes", () => {
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

  it("creates a sticky note", async () => {
    const res = await request(app).post("/stickyNotes").send({
      blockId: "blockId",
      text: "sticky note text",
    });
    expect(res.status).toBe(201);

    const stickyNotes = await db.collection("stickynotes").find().toArray();
    expect(stickyNotes.length).toBe(1);
    expect(stickyNotes[0].blockId).toBe("blockId");
    expect(stickyNotes[0].text).toBe("sticky note text");

    await db.collection("stickynotes").deleteMany();
  });

  it("gets sticky notes", async () => {
    await db.collection("stickynotes").insertOne({
      _id: new ObjectId("0000aaaa1111bbbb2222cccc"),
      blockId: "0000aaaa1111bbbb2222cccc",
      text: "sticky note text",
    });

    const res = await request(app).get("/stickyNotes/0000aaaa1111bbbb2222cccc");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      _id: "0000aaaa1111bbbb2222cccc",
      blockId: "0000aaaa1111bbbb2222cccc",
      text: "sticky note text",
    });

    await db.collection("stickynotes").deleteMany();
  });

  it("updates a sticky note", async () => {
    const stickyNoteId = (
      await db.collection("stickynotes").insertOne({
        blockId: "blockId",
        text: "sticky note text",
      })
    ).insertedId.toString();

    const res = await request(app).patch(`/stickyNotes/blockId`).send({
      text: "new sticky note text",
    });
    expect(res.status).toBe(204);
    const stickyNotes = await db.collection("stickynotes").find().toArray();
    expect(stickyNotes.length).toBe(1);
    expect(stickyNotes[0]).toEqual({
      _id: new ObjectId(stickyNoteId),
      blockId: "blockId",
      text: "new sticky note text",
    });

    await db.collection("stickynotes").deleteMany();
  });

  it("deletes a sticky note", async () => {
    await db.collection("stickynotes").insertOne({
      blockId: "blockId",
      text: "sticky note text",
    });

    const res = await request(app).delete(`/stickyNotes/blockId`);
    expect(res.status).toBe(204);
    const stickyNotes = await db.collection("stickynotes").find().toArray();
    expect(stickyNotes.length).toBe(0);
  });

  it("properly manages user storage", async () => {
    await db.collection<{ _id: string } & Document>("users").insertOne({
      _id: "userId",
      storage: 0,
    });
    const cookie = mockSession("session", process.env.SESSION_SECRET, {
      userId: "userId",
    });

    // Create a sticky note.
    await request(app).post("/stickyNotes").set("Cookie", [cookie]).send({
      blockId: "blockId",
      text: "sticky note text",
    });
    let user = await db
      .collection<{ _id: string } & Document>("users")
      .findOne({ _id: "userId" });
    let storage = user?.storage;
    expect(storage).toBeGreaterThan(0);

    // Update the sticky note.
    await request(app)
      .patch(`/stickyNotes/blockId`)
      .set("Cookie", [cookie])
      .send({
        text: "new sticky note text",
      });
    user = await db
      .collection<{ _id: string } & Document>("users")
      .findOne({ _id: "userId" });
    expect(user?.storage).toBeGreaterThan(storage);
    storage = user?.storage;

    // Update the sticky note again.
    await request(app)
      .patch(`/stickyNotes/blockId`)
      .set("Cookie", [cookie])
      .send({
        text: "sticky note text",
      });
    user = await db
      .collection<{ _id: string } & Document>("users")
      .findOne({ _id: "userId" });
    expect(user?.storage).toBeLessThan(storage);
    storage = user?.storage;

    // Delete the sticky note.
    await request(app).delete(`/stickyNotes/blockId`).set("Cookie", [cookie]);
    user = await db
      .collection<{ _id: string } & Document>("users")
      .findOne({ _id: "userId" });
    expect(user?.storage).toBe(0);

    await db.collection("users").deleteMany();
  });
});
