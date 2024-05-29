/** Integration tests for resource endpoints using an in-memory MongoDB testing database. */

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
describe("Resources", () => {
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

  it("creates a resource", async () => {
    await db.collection("blocks").insertOne({
      _id: new ObjectId("0000aaaa1111bbbb2222cccc"),
      items: [],
    });

    const res = await request(app)
      .post("/resources")
      .field("blockId", "0000aaaa1111bbbb2222cccc")
      .field("name", "resourceName")
      .attach("resource-image", "tests/mockData/testImage.png");
    expect(res.status).toBe(201);

    const resources = await db.collection("resources").find().toArray();
    expect(resources.length).toBe(1);
    expect(resources[0].blockId).toBe("0000aaaa1111bbbb2222cccc");
    expect(resources[0].name).toBe("resourceName");
    expect(resources[0].imageId).toBeDefined();
    expect(resources[0].imageName).toBe("testImage.png");

    const blocks = await db.collection("blocks").find().toArray();
    expect(blocks.length).toBe(1);
    expect(blocks[0].items).toEqual([resources[0]._id.toString()]);

    await db.collection("resources").deleteMany();
    await db.collection("blocks").deleteMany();
    await db.collection("asterspark-images.files").deleteMany();
    await db.collection("asterspark-images.chunks").deleteMany();
  });

  it("gets resources", async () => {
    const resourceId = (
      await db.collection("resources").insertOne({
        blockId: "blockId",
        name: "resourceName",
        imageId: "resourceImageId",
        imageName: "resourceImageName",
      })
    ).insertedId.toString();

    const res = await request(app).get("/resources/blockId");
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0]).toEqual({
      _id: resourceId,
      blockId: "blockId",
      name: "resourceName",
      imageId: "resourceImageId",
      imageName: "resourceImageName",
    });

    await db.collection("resources").deleteMany();
  });

  it("gets resource image", async () => {
    const imageId = (
      await db.collection("asterspark-images.files").insertOne({
        length: "312658",
        chunkSize: "261120",
        uploadDate: "2023-06-08T17:30:03.110+00:00",
        filename: "imageName",
        contentType: "image/jpeg",
      })
    ).insertedId.toString();

    const res = await request(app).get(`/resources/images/${imageId}`);
    expect(res.status).toBe(200);

    await db.collection("asterspark-images.files").deleteMany();
  });

  it("updates a resource", async () => {
    const resourceId = (
      await db.collection("resources").insertOne({
        blockId: "blockId",
        name: "resourceName",
        imageId: "resourceImageId",
        imageName: "resourceImageName",
      })
    ).insertedId.toString();

    const res = await request(app).patch(`/resources/${resourceId}`).send({
      name: "newResourceName",
    });
    expect(res.status).toBe(204);
    const resources = await db.collection("resources").find().toArray();
    expect(resources.length).toBe(1);
    expect(resources[0]).toEqual({
      _id: new ObjectId(resourceId),
      blockId: "blockId",
      name: "newResourceName",
      imageId: "resourceImageId",
      imageName: "resourceImageName",
    });

    await db.collection("resources").deleteMany();
  });

  it("deletes a resource", async () => {
    await db.collection("blocks").insertOne({
      _id: new ObjectId("0000aaaa1111bbbb2222cccc"),
      items: [],
    });
    const resourceId = (
      await db.collection("resources").insertOne({
        blockId: "0000aaaa1111bbbb2222cccc",
        name: "resourceName",
      })
    ).insertedId.toString();
    // Update the block to include the resource.
    await db
      .collection("blocks")
      .updateOne(
        { _id: new ObjectId("0000aaaa1111bbbb2222cccc") },
        { $push: { items: resourceId } }
      );

    const res = await request(app).delete(`/resources/${resourceId}`);
    expect(res.status).toBe(204);
    const resources = await db.collection("resources").find().toArray();
    expect(resources.length).toBe(0);
    const blocks = await db.collection("blocks").find().toArray();
    expect(blocks.length).toBe(1);
    expect(blocks[0].items).toEqual([]);

    await db.collection("blocks").deleteMany();
  });

  it("properly manages user storage", async () => {
    await db.collection<{ _id: string } & Document>("users").insertOne({
      _id: "userId",
      storage: 0,
    });
    const cookie = mockSession("session", process.env.SESSION_SECRET, {
      userId: "userId",
    });

    // Create a resource.
    await request(app)
      .post("/resources")
      .set("Cookie", [cookie])
      .field("blockId", "0000aaaa1111bbbb2222cccc")
      .field("name", "resourceName")
      .attach("resource-image", "tests/mockData/testImage.png");
    let user = await db
      .collection<{ _id: string } & Document>("users")
      .findOne({ _id: "userId" });
    let storage = user?.storage;
    expect(storage).toBeGreaterThan(0);

    // Update the resource.
    const resources = await db.collection("resources").find().toArray();
    const resourceId = resources[0]._id.toString();
    await request(app)
      .patch(`/resources/${resourceId}`)
      .set("Cookie", [cookie])
      .send({
        name: "newResourceName",
      });
    user = await db
      .collection<{ _id: string } & Document>("users")
      .findOne({ _id: "userId" });
    expect(user?.storage).toBeGreaterThan(storage);
    storage = user?.storage;

    // Update the resource again.
    await request(app)
      .patch(`/resources/${resourceId}`)
      .set("Cookie", [cookie])
      .send({
        name: "resourceName",
      });
    user = await db
      .collection<{ _id: string } & Document>("users")
      .findOne({ _id: "userId" });
    expect(user?.storage).toBeLessThan(storage);
    storage = user?.storage;

    // Delete the resource.
    await request(app)
      .delete(`/resources/${resourceId}`)
      .set("Cookie", [cookie]);
    user = await db
      .collection<{ _id: string } & Document>("users")
      .findOne({ _id: "userId" });
    expect(user?.storage).toBe(0);

    await db.collection("users").deleteMany();
  });
});
