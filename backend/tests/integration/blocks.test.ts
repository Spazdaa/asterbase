/** Integration tests for block endpoints using an in-memory MongoDB testing database. */

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
describe("Blocks", () => {
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

  it("creates a block", async () => {
    const cookie = mockSession("session", process.env.SESSION_SECRET, {
      userId: "userId",
    });

    const res = await request(app)
      .post("/blocks")
      .set("Cookie", [cookie])
      .send({
        workspaceId: "workspaceId",
        type: "sticky",
        x: 0,
        y: 0,
        width: 80,
        height: 80,
      });
    expect(res.status).toBe(201);

    const blocks = await db.collection("blocks").find().toArray();
    expect(blocks.length).toBe(1);
    expect(blocks[0].workspaceId).toBe("workspaceId");
    expect(blocks[0].userId).toBe("userId");
    expect(blocks[0].type).toBe("sticky");
    expect(blocks[0].x).toBe(0);
    expect(blocks[0].y).toBe(0);
    expect(blocks[0].width).toBe(80);
    expect(blocks[0].height).toBe(80);
    expect(blocks[0].items).toEqual([]);

    await db.collection("blocks").deleteMany();
  });

  it("gets blocks", async () => {
    const stickyBlockId = (
      await db.collection("blocks").insertOne({
        workspaceId: "workspaceId",
        userId: "userId",
        type: "sticky",
        x: 0,
        y: 0,
        width: 80,
        height: 80,
      })
    ).insertedId.toString();
    const projectBlockId = (
      await db.collection("blocks").insertOne({
        workspaceId: "workspaceId",
        userId: "userId",
        type: "project",
        x: 0,
        y: 0,
        items: [],
      })
    ).insertedId.toString();
    const resourceBlockId = (
      await db.collection("blocks").insertOne({
        workspaceId: "workspaceId",
        userId: "userId",
        type: "resource",
        x: 0,
        y: 0,
        items: [],
      })
    ).insertedId.toString();
    await db.collection("stickynotes").insertOne({
      _id: new ObjectId(stickyBlockId),
      blockId: stickyBlockId,
      text: "sticky note text",
    });
    const projectId = (
      await db.collection("projects").insertOne({
        blockId: projectBlockId,
        name: "projectName",
        link: "projectLink",
        image: "projectImage",
      })
    ).insertedId.toString();
    const projectId2 = (
      await db.collection("projects").insertOne({
        blockId: projectBlockId,
        name: "projectName2",
        link: "projectLink2",
        image: "projectImage2",
      })
    ).insertedId.toString();
    const resourceId = (
      await db.collection("resources").insertOne({
        blockId: resourceBlockId,
        name: "resourceName",
      })
    ).insertedId.toString();
    const resourceId2 = (
      await db.collection("resources").insertOne({
        blockId: resourceBlockId,
        name: "resourceName2",
      })
    ).insertedId.toString();
    // Add IDs to the corresponding blocks. Use reverse order to test sorting.
    await db
      .collection("blocks")
      .updateOne(
        { _id: new ObjectId(projectBlockId) },
        { $push: { items: projectId2 } }
      );
    await db
      .collection("blocks")
      .updateOne(
        { _id: new ObjectId(projectBlockId) },
        { $push: { items: projectId } }
      );
    await db
      .collection("blocks")
      .updateOne(
        { _id: new ObjectId(resourceBlockId) },
        { $push: { items: resourceId2 } }
      );
    await db
      .collection("blocks")
      .updateOne(
        { _id: new ObjectId(resourceBlockId) },
        { $push: { items: resourceId } }
      );

    const cookie = mockSession("session", process.env.SESSION_SECRET, {
      userId: "userId",
    });
    const res = await request(app)
      .get("/blocks/workspaceId")
      .set("Cookie", [cookie]);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(3);
    expect(res.body).toEqual([
      {
        _id: stickyBlockId,
        workspaceId: "workspaceId",
        type: "sticky",
        x: 0,
        y: 0,
        width: 80,
        height: 80,
        stickyText: "sticky note text",
      },
      {
        _id: projectBlockId,
        workspaceId: "workspaceId",
        type: "project",
        x: 0,
        y: 0,
        items: [projectId2, projectId],
        projects: [
          {
            _id: projectId2,
            blockId: projectBlockId,
            name: "projectName2",
            link: "projectLink2",
            image: "projectImage2",
          },
          {
            _id: projectId,
            blockId: projectBlockId,
            name: "projectName",
            link: "projectLink",
            image: "projectImage",
          },
        ],
      },
      {
        _id: resourceBlockId,
        workspaceId: "workspaceId",
        type: "resource",
        x: 0,
        y: 0,
        items: [resourceId2, resourceId],
        resources: [
          {
            _id: resourceId2,
            blockId: resourceBlockId,
            name: "resourceName2",
          },
          {
            _id: resourceId,
            blockId: resourceBlockId,
            name: "resourceName",
          },
        ],
      },
    ]);

    await db.collection("blocks").deleteMany();
    await db.collection("stickynotes").deleteMany();
    await db.collection("projects").deleteMany();
    await db.collection("resources").deleteMany();
  });

  it("updates a sticky note block", async () => {
    const blockId = (
      await db.collection("blocks").insertOne({
        workspaceId: "workspaceId",
        type: "sticky",
        x: 0,
        y: 0,
        width: 80,
        height: 80,
      })
    ).insertedId;

    const res = await request(app).patch(`/blocks/${blockId.toString()}`).send({
      x: 1,
      y: 1,
      width: 100,
      height: 100,
    });

    expect(res.status).toBe(204);
    const blocks = await db.collection("blocks").find().toArray();
    expect(blocks.length).toBe(1);
    expect(blocks[0].x).toBe(1);
    expect(blocks[0].y).toBe(1);
    expect(blocks[0].width).toBe(100);
    expect(blocks[0].height).toBe(100);

    await db.collection("blocks").deleteMany();
  });

  it("updates a resource block", async () => {
    const blockId = (
      await db.collection("blocks").insertOne({
        workspaceId: "workspaceId",
        type: "resource",
        x: 0,
        y: 0,
        items: [],
      })
    ).insertedId;

    const res = await request(app)
      .patch(`/blocks/${blockId.toString()}`)
      .send({
        x: 1,
        y: 1,
        width: 100,
        height: 100,
        items: ["resourceId"],
      });

    expect(res.status).toBe(204);
    const blocks = await db.collection("blocks").find().toArray();
    expect(blocks.length).toBe(1);
    expect(blocks[0].x).toBe(1);
    expect(blocks[0].y).toBe(1);
    expect(blocks[0].width).toBe(100);
    expect(blocks[0].height).toBe(100);
    expect(blocks[0].items).toEqual(["resourceId"]);

    await db.collection("blocks").deleteMany();
  });

  it("updates a project block", async () => {
    const blockId = (
      await db.collection("blocks").insertOne({
        workspaceId: "workspaceId",
        type: "project",
        x: 0,
        y: 0,
        items: [],
      })
    ).insertedId;

    const res = await request(app)
      .patch(`/blocks/${blockId.toString()}`)
      .send({
        x: 1,
        y: 1,
        width: 100,
        height: 100,
        items: ["projectId"],
      });

    expect(res.status).toBe(204);
    const blocks = await db.collection("blocks").find().toArray();
    expect(blocks.length).toBe(1);
    expect(blocks[0].x).toBe(1);
    expect(blocks[0].y).toBe(1);
    expect(blocks[0].width).toBe(100);
    expect(blocks[0].height).toBe(100);
    expect(blocks[0].items).toEqual(["projectId"]);

    await db.collection("blocks").deleteMany();
  });

  it("deletes a block", async () => {
    const blockId = (
      await db.collection("blocks").insertOne({
        workspaceId: "workspaceId",
        type: "sticky",
      })
    ).insertedId.toString();
    await db.collection("stickynotes").insertOne({
      blockId,
      text: "sticky note text",
    });

    const res = await request(app).delete(`/blocks/${blockId}`);
    expect(res.status).toBe(204);
    const blocks = await db.collection("blocks").find().toArray();
    expect(blocks.length).toBe(0);
    const stickynotes = await db.collection("stickynotes").find().toArray();
    expect(stickynotes.length).toBe(0);
  });

  it("properly manages user storage", async () => {
    await db.collection<{ _id: string } & Document>("users").insertOne({
      _id: "userId",
      storage: 0,
    });
    const cookie = mockSession("session", process.env.SESSION_SECRET, {
      userId: "userId",
    });

    // Create a block.
    await request(app).post("/blocks").set("Cookie", [cookie]).send({
      workspaceId: "workspaceId",
      type: "project",
      x: 0,
      y: 0,
      width: 80,
      height: 80,
      items: [],
    });
    let user = await db
      .collection<{ _id: string } & Document>("users")
      .findOne({ _id: "userId" });
    let storage = user?.storage;
    expect(storage).toBeGreaterThan(0);

    // Update the block.
    const blocks = await db.collection("blocks").find().toArray();
    const blockId = blocks[0]._id.toString();
    await request(app)
      .patch(`/blocks/${blockId}`)
      .set("Cookie", [cookie])
      .send({
        x: 1,
        y: 1,
        width: 100,
        height: 100,
        items: ["projectId1", "projectId2"],
      });
    user = await db
      .collection<{ _id: string } & Document>("users")
      .findOne({ _id: "userId" });
    expect(user?.storage).toBeGreaterThan(storage);
    storage = user?.storage;

    // Update the block again.
    await request(app)
      .patch(`/blocks/${blockId}`)
      .set("Cookie", [cookie])
      .send({
        x: 0,
        y: 0,
        width: 80,
        height: 80,
        items: ["projectId1"],
      });
    user = await db
      .collection<{ _id: string } & Document>("users")
      .findOne({ _id: "userId" });
    expect(user?.storage).toBeLessThan(storage);
    storage = user?.storage;

    // Add items to the block.
    await request(app)
      .post("/projects")
      .set("Cookie", [cookie])
      .field("blockId", blockId)
      .field("name", "projectName")
      .field("description", "projectDescription")
      .attach("project-image", "tests/mockData/testImage.png");
    await request(app)
      .post("/projects")
      .set("Cookie", [cookie])
      .field("blockId", blockId)
      .field("name", "projectName")
      .field("description", "projectDescription")
      .attach("project-image", "tests/mockData/testImage.png");
    await request(app)
      .post("/resources")
      .set("Cookie", [cookie])
      .field("blockId", blockId)
      .field("name", "resourceName")
      .attach("resource-image", "tests/mockData/testImage.png");
    await request(app)
      .post("/resources")
      .set("Cookie", [cookie])
      .field("blockId", blockId)
      .field("name", "resourceName")
      .attach("resource-image", "tests/mockData/testImage.png");
    await request(app).post("/stickyNotes").set("Cookie", [cookie]).send({
      blockId,
      text: "sticky note text",
    });

    // Delete the block.
    await request(app).delete(`/blocks/${blockId}`).set("Cookie", [cookie]);
    user = await db
      .collection<{ _id: string } & Document>("users")
      .findOne({ _id: "userId" });
    expect(user?.storage).toBe(0);

    await db.collection("users").deleteMany();
  });
});
