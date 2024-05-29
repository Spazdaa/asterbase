/** Integration tests for billing endpoints using an in-memory MongoDB testing database. */

import { type NextFunction, type Request, type Response } from "express";
import { type Db, type Document, MongoClient } from "mongodb";
import request from "supertest";

import { close } from "../../db/db";
import { createStripeWebhookEvent, storage } from "../../utils";

const app = require("../../app");

// Skip authentication middleware and Stripe functions.
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
    createStripeWebhookEvent: jest.fn(() => ({
      data: {
        object: {
          created: "1609459200",
          client_reference_id: "64655c7aaa1a71a29aca4ae4",
          customer: "customerId",
          subscription: "subscriptionId",
        },
      },
      type: "checkout.session.completed",
    })),
  };
});

// Tests.
describe("Billing", () => {
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

  it("registers payment for a user", async () => {
    await db.collection<{ _id: string } & Document>("users").insertOne({
      _id: "64655c7aaa1a71a29aca4ae4",
      email: "email",
      name: "name",
    });

    const res = await request(app).post("/billing/webhook");
    expect(res.status).toBe(204);
    const users = await db.collection("users").find().toArray();
    expect(users.length).toBe(1);
    expect(users[0].customerId).toBe("customerId");
    expect(users[0].subscriptionId).toBe("subscriptionId");
    expect(users[0].subscriptionExpiry).toEqual(new Date("2021-02-03"));

    await db.collection("users").deleteMany();
  });

  it("clears the expiry date if payment fails", async () => {
    (createStripeWebhookEvent as jest.Mock).mockReturnValueOnce({
      data: {
        object: {
          created: "1609459200",
          client_reference_id: "64655c7aaa1a71a29aca4ae4",
          customer: "customerId",
          subscription: "subscriptionId",
        },
      },
      type: "invoice.payment_failed",
    });
    await db.collection<{ _id: string } & Document>("users").insertOne({
      _id: "64655c7aaa1a71a29aca4ae4",
      email: "email",
      name: "name",
    });

    const res = await request(app).post("/billing/webhook");
    expect(res.status).toBe(204);
    const users = await db.collection("users").find().toArray();
    expect(users.length).toBe(1);
    expect(users[0].customerId).toBe("customerId");
    expect(users[0].subscriptionId).toBe("subscriptionId");
    expect(users[0].subscriptionExpiry).toBeUndefined();

    await db.collection("users").deleteMany();
  });
});
