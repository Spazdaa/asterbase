/** Integration tests for authentication endpoints using an in-memory MongoDB testing database. */

import { type Db, type Document, MongoClient } from "mongodb";
import request from "supertest";

import { close } from "../../db/db";
import { storage } from "../../utils";

const app = require("../../app");
// Use mock-session to set the express-cookie session middleware.
const mockSession = require("mock-session");

// Mock Google functions.
jest.mock("../../utils", () => {
  const originalModule = jest.requireActual("../../utils");
  return {
    __esModule: true,
    ...originalModule,
    verify: jest.fn(() => ({
      sub: "64655c7aaa1a71a29aca4ae4",
      email: "email",
      firstName: "User",
      lastName: "Name",
      birthdate: "2023-07-01",
    })),
  };
});

// Tests.
describe("Auth", () => {
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

  it("logs in", async () => {
    await db.collection<{ _id: string } & Document>("users").insertOne({
      _id: "64655c7aaa1a71a29aca4ae4",
      email: "email",
      name: "name",
      subscriptionExpiry: Date.now() + 1000,
      storage: 0,
    });

    const res = await request(app).post("/auth/login").send({
      credential: "credential",
    });
    expect(res.status).toBe(201);
    expect(res.body.subscriptionStatus).toBe("active");
    expect(
      res.headers["set-cookie"][0].startsWith("session=;")
    ).not.toBeTruthy();

    await db.collection("users").deleteMany();
  });

  it("creates a new user", async () => {
    const res = await request(app).post("/auth/login").send({
      credential: "credential",
    });
    expect(res.status).toBe(201);
    expect(res.body.subscriptionStatus).toBe("inactive");
    expect(
      res.headers["set-cookie"][0].startsWith("session=;")
    ).not.toBeTruthy();

    const users = await db.collection("users").find().toArray();
    expect(users.length).toBe(1);
    expect(users[0].storage).toBeGreaterThan(0);

    const workspaces = await db.collection("workspaces").find().toArray();
    expect(workspaces.length).toBe(1);
    expect(workspaces[0].userId).toBe(users[0]._id);
    expect(workspaces[0].name).toBe("Workspace 1");

    await db.collection("users").deleteMany();
    await db.collection("workspaces").deleteMany();
  });

  it("verifies a user's login", async () => {
    await db.collection<{ _id: string } & Document>("users").insertOne({
      _id: "64655c7aaa1a71a29aca4ae4",
      email: "email",
      name: "name",
      subscriptionExpiry: Date.now() + 1000,
      storage: 0,
    });
    const cookie = mockSession("session", process.env.SESSION_SECRET, {
      userId: "64655c7aaa1a71a29aca4ae4",
    });

    const res = await request(app).post("/auth/verify").set("Cookie", [cookie]);

    expect(res.status).toBe(200);
    expect(res.body.subscriptionStatus).toBe("active");
    expect(
      res.headers["set-cookie"][0].startsWith("session=;")
    ).not.toBeTruthy();

    await db.collection("users").deleteMany();
  });

  it("logs out", async () => {
    const res = await request(app).post("/auth/logout");
    expect(res.status).toBe(204);
    expect(res.headers["set-cookie"][0].startsWith("session=;"));
  });

  it("gets a user's information", async () => {
    await db.collection<{ _id: string } & Document>("users").insertOne({
      _id: "64655c7aaa1a71a29aca4ae4",
      email: "email",
      name: "name",
      storage: 0,
    });
    const cookie = mockSession("session", process.env.SESSION_SECRET, {
      userId: "64655c7aaa1a71a29aca4ae4",
    });

    const res = await request(app).get("/auth/user").set("Cookie", [cookie]);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      _id: "64655c7aaa1a71a29aca4ae4",
      email: "email",
      name: "name",
      storage: 0,
    });

    await db.collection("users").deleteMany();
  });
});
