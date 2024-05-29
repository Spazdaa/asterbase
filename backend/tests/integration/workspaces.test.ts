/** Integration tests for workspace endpoints using an in-memory MongoDB testing database. */

import { type NextFunction } from "express";
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
describe("Workspaces", () => {
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

  it("creates a workspace", async () => {
    const cookie = mockSession("session", process.env.SESSION_SECRET, {
      userId: "userId",
    });
    const res = await request(app)
      .post("/workspaces")
      .set("Cookie", [cookie])
      .send({
        name: "Workspace 1",
      });
    expect(res.status).toBe(201);

    const workspaces = await db.collection("workspaces").find().toArray();
    expect(workspaces.length).toBe(1);
    expect(workspaces[0].userId).toBe("userId");
    expect(workspaces[0].name).toBe("Workspace 1");

    await db.collection("workspaces").deleteMany();
  });

  it("gets workspaces", async () => {
    const workspaceId = (
      await db.collection("workspaces").insertOne({
        userId: "userId",
        name: "Workspace 1",
      })
    ).insertedId.toString();

    const cookie = mockSession("session", process.env.SESSION_SECRET, {
      userId: "userId",
    });
    const res = await request(app).get("/workspaces").set("Cookie", [cookie]);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body).toEqual([
      {
        _id: workspaceId,
        userId: "userId",
        name: "Workspace 1",
      },
    ]);

    await db.collection("workspaces").deleteMany();
  });

  it("properly manages user storage", async () => {
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
    const user = await db
      .collection<{ _id: string } & Document>("users")
      .findOne({ _id: "userId" });
    expect(user?.storage).toBeGreaterThan(0);

    await db.collection("users").deleteMany();
    await db.collection("workspaces").deleteMany();
  });
});
