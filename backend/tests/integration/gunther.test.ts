/** Integration tests for Gunther AI endpoints using an in-memory MongoDB testing database. */

import { type NextFunction } from "express";
import { type Db, type Document, MongoClient } from "mongodb";
import request from "supertest";

import { close } from "../../db/db";
import { storage } from "../../utils";

const app = require("../../app");
// Use mock-session to set the express-cookie session middleware.
const mockSession = require("mock-session");

// Skip authentication middleware and OpenAI API calls.
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
    createAICompletion: jest.fn(() => "completion"),
  };
});

// Tests.
describe("Gunther AI", () => {
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

  it("creates a follow up request", async () => {
    await db.collection<{ _id: string } & Document>("users").insertOne({
      _id: "userId",
      guntherSessions: 15,
      guntherEnabled: true,
    });
    const cookie = mockSession("session", process.env.SESSION_SECRET, {
      userId: "userId",
    });

    const res = await request(app)
      .post("/gunther/followUp")
      .send({ topic: "topic", explanation: "explanation" })
      .set("Cookie", [cookie]);

    expect(res.status).toBe(200);
    expect(res.text).toEqual("completion");

    await db.collection("users").deleteMany();
  });

  it("creates a gaps request", async () => {
    await db.collection<{ _id: string } & Document>("users").insertOne({
      _id: "userId",
      guntherSessions: 15,
      guntherEnabled: true,
    });
    const cookie = mockSession("session", process.env.SESSION_SECRET, {
      userId: "userId",
    });

    const res = await request(app)
      .post("/gunther/gaps")
      .send({
        topic: "topic",
        explanation: "explanation",
        questions: "questions",
        responses: "responses",
      })
      .set("Cookie", [cookie]);

    expect(res.status).toBe(200);
    expect(res.text).toEqual("completion");

    await db.collection("users").deleteMany();
  });

  it("starts a gunther session", async () => {
    await db.collection<{ _id: string } & Document>("users").insertOne({
      _id: "userId",
      guntherSessions: 15,
    });
    const cookie = mockSession("session", process.env.SESSION_SECRET, {
      userId: "userId",
    });

    const res = await request(app).post("/gunther").set("Cookie", [cookie]);

    expect(res.status).toBe(204);
    const users = await db.collection("users").find().toArray();
    expect(users.length).toBe(1);
    expect(users[0].guntherSessions).toBe(14);

    await db.collection("users").deleteMany();
  });

  it("gets the number of remaining gunther sessions", async () => {
    await db.collection<{ _id: string } & Document>("users").insertOne({
      _id: "userId",
      guntherSessions: 15,
    });
    const cookie = mockSession("session", process.env.SESSION_SECRET, {
      userId: "userId",
    });

    const res = await request(app).get("/gunther").set("Cookie", [cookie]);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ sessions: 15 });

    await db.collection("users").deleteMany();
  });
});
