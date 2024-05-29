/** Integration tests for project endpoints using an in-memory MongoDB testing database. */

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
describe("Projects", () => {
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

  it("creates a project", async () => {
    await db.collection("blocks").insertOne({
      _id: new ObjectId("0000aaaa1111bbbb2222cccc"),
      items: [],
    });

    const res = await request(app)
      .post("/projects")
      .field("blockId", "0000aaaa1111bbbb2222cccc")
      .field("name", "projectName")
      .field("description", "projectDescription")
      .attach("project-image", "tests/mockData/testImage.png");
    expect(res.status).toBe(201);

    const projects = await db.collection("projects").find().toArray();
    expect(projects.length).toBe(1);
    expect(projects[0].blockId).toBe("0000aaaa1111bbbb2222cccc");
    expect(projects[0].name).toBe("projectName");
    expect(projects[0].imageId).toBeDefined();
    expect(projects[0].imageName).toBe("testImage.png");
    expect(projects[0].description).toBe("projectDescription");

    const blocks = await db.collection("blocks").find().toArray();
    expect(blocks.length).toBe(1);
    expect(blocks[0].items).toEqual([projects[0]._id.toString()]);

    await db.collection("projects").deleteMany();
    await db.collection("blocks").deleteMany();
    await db.collection("asterspark-images.files").deleteMany();
    await db.collection("asterspark-images.chunks").deleteMany();
  });

  it("gets projects", async () => {
    const projectId = (
      await db.collection("projects").insertOne({
        blockId: "blockId",
        name: "projectName",
        imageId: "projectImageId",
        imageName: "projectImageName",
        description: "projectDescription",
      })
    ).insertedId.toString();

    const res = await request(app).get("/projects/blockId");
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0]).toEqual({
      _id: projectId,
      blockId: "blockId",
      name: "projectName",
      imageId: "projectImageId",
      imageName: "projectImageName",
      description: "projectDescription",
    });

    await db.collection("projects").deleteMany();
  });

  it("gets project image", async () => {
    const imageId = (
      await db.collection("asterspark-images.files").insertOne({
        length: "312658",
        chunkSize: "261120",
        uploadDate: "2023-06-08T17:30:03.110+00:00",
        filename: "imageName",
        contentType: "image/jpeg",
      })
    ).insertedId.toString();

    const res = await request(app).get(`/projects/images/${imageId}`);
    expect(res.status).toBe(200);

    await db.collection("asterspark-images.files").deleteMany();
  });

  it("updates a project", async () => {
    const projectId = (
      await db.collection("projects").insertOne({
        blockId: "blockId",
        name: "projectName",
        imageId: "projectImageId",
        imageName: "projectImageName",
        description: "projectDescription",
      })
    ).insertedId.toString();

    const res = await request(app).patch(`/projects/${projectId}`).send({
      name: "newProjectName",
    });
    expect(res.status).toBe(204);
    const projects = await db.collection("projects").find().toArray();
    expect(projects.length).toBe(1);
    expect(projects[0]).toEqual({
      _id: new ObjectId(projectId),
      blockId: "blockId",
      name: "newProjectName",
      imageId: "projectImageId",
      imageName: "projectImageName",
      description: "projectDescription",
    });

    await db.collection("projects").deleteMany();
  });

  it("deletes a project", async () => {
    await db.collection("blocks").insertOne({
      _id: new ObjectId("0000aaaa1111bbbb2222cccc"),
      items: [],
    });
    const projectId = (
      await db.collection("projects").insertOne({
        blockId: "0000aaaa1111bbbb2222cccc",
        name: "projectName",
        description: "projectDescription",
      })
    ).insertedId.toString();
    // Update the block to include the project.
    await db
      .collection("blocks")
      .updateOne(
        { _id: new ObjectId("0000aaaa1111bbbb2222cccc") },
        { $push: { items: projectId } }
      );

    const res = await request(app).delete(`/projects/${projectId}`);
    expect(res.status).toBe(204);
    const projects = await db.collection("projects").find().toArray();
    expect(projects.length).toBe(0);
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

    // Create a project.
    await request(app)
      .post("/projects")
      .set("Cookie", [cookie])
      .field("blockId", "0000aaaa1111bbbb2222cccc")
      .field("name", "projectName")
      .field("description", "projectDescription")
      .attach("project-image", "tests/mockData/testImage.png");
    let user = await db
      .collection<{ _id: string } & Document>("users")
      .findOne({ _id: "userId" });
    let storage = user?.storage;
    expect(storage).toBeGreaterThan(0);

    // Update the project.
    const projects = await db.collection("projects").find().toArray();
    const projectId = projects[0]._id.toString();
    await request(app)
      .patch(`/projects/${projectId}`)
      .set("Cookie", [cookie])
      .send({
        name: "newProjectName",
      });
    user = await db
      .collection<{ _id: string } & Document>("users")
      .findOne({ _id: "userId" });
    expect(user?.storage).toBeGreaterThan(storage);
    storage = user?.storage;

    // Update the project again.
    await request(app)
      .patch(`/projects/${projectId}`)
      .set("Cookie", [cookie])
      .send({
        name: "projectName",
      });
    user = await db
      .collection<{ _id: string } & Document>("users")
      .findOne({ _id: "userId" });
    expect(user?.storage).toBeLessThan(storage);
    storage = user?.storage;

    // Delete the project.
    await request(app).delete(`/projects/${projectId}`).set("Cookie", [cookie]);
    user = await db
      .collection<{ _id: string } & Document>("users")
      .findOne({ _id: "userId" });
    expect(user?.storage).toBe(0);

    await db.collection("users").deleteMany();
  });
});
