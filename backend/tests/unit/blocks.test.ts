/** Unit tests for block endpoints. Authentication and database connections are mocked. */

import { type NextFunction, type Request, type Response } from "express";
import { ObjectId } from "mongodb";
import request from "supertest";

import User from "../../db/models/auth";
import Block from "../../db/models/blocks";
import Project from "../../db/models/projects";
import Resource from "../../db/models/resources";
import StickyNote from "../../db/models/stickyNotes";

const app = require("../../app");

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

// Mock database connection.
jest.mock("../../db/db", () => ({
  connect: jest.fn(),
}));

// Mock database functions.
jest.mock("../../db/models/blocks", () => ({
  find: jest.fn(() => ({
    lean: jest.fn(() => [
      {
        _id: new ObjectId("0000aaaa1111bbbb2222cccc"),
        workspaceId: "workspaceId",
        userId: "userId",
        type: "blockType",
        x: 0,
        y: 0,
        __v: 0,
      },
    ]),
  })),
  findOne: jest.fn(() => ({
    lean: jest.fn(() => ({
      _id: new ObjectId("0000aaaa1111bbbb2222cccc"),
      workspaceId: "workspaceId",
      userId: "userId",
      type: "blockType",
      x: 0,
      y: 0,
      __v: 0,
    })),
  })),
  create: jest.fn(() => ({
    _id: new ObjectId("0000aaaa1111bbbb2222cccc"),
    workspaceId: "workspaceId",
    userId: "userId",
    type: "blockType",
    x: 0,
    y: 0,
  })),
  updateOne: jest.fn(),
  deleteOne: jest.fn(),
}));
jest.mock("../../db/models/resources", () => ({
  find: jest.fn(() => ({
    lean: jest.fn(() => [
      {
        _id: new ObjectId("0000aaaa1111bbbb2222dddd"),
        blockId: "0000aaaa1111bbbb2222cccc",
        name: "resourceName",
        __v: 0,
      },
    ]),
  })),
  deleteMany: jest.fn(),
}));
jest.mock("../../db/models/stickyNotes", () => ({
  find: jest.fn(() => ({
    lean: jest.fn(() => [
      {
        _id: new ObjectId("0000aaaa1111bbbb2222dddd"),
        blockId: "0000aaaa1111bbbb2222cccc",
        text: "sticky note text",
        __v: 0,
      },
    ]),
  })),
  deleteMany: jest.fn(),
}));
jest.mock("../../db/models/projects", () => ({
  find: jest.fn(() => ({
    lean: jest.fn(() => [
      {
        _id: new ObjectId("0000aaaa1111bbbb2222eeee"),
        blockId: "0000aaaa1111bbbb2222cccc",
        name: "projectName",
        link: "projectLink",
        image: "projectImage",
        __v: 0,
      },
      {
        _id: new ObjectId("0000aaaa1111bbbb2222dddd"),
        blockId: "0000aaaa1111bbbb2222cccc",
        name: "projectName",
        link: "projectLink",
        image: "projectImage",
        __v: 0,
      },
    ]),
  })),
  deleteMany: jest.fn(),
}));
jest.mock("../../db/models/auth", () => ({
  find: jest.fn(() => ({
    lean: jest.fn(() => [
      {
        _id: new ObjectId("0000aaaa1111bbbb2222cccc"),
        storage: 0,
        __v: 0,
      },
    ]),
  })),
  updateOne: jest.fn(),
}));

describe("Blocks", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("creates a block", async () => {
    const res = await request(app).post("/blocks").send({
      workspaceId: "workspaceId",
      type: "blockType",
      x: 0,
      y: 0,
      height: 80,
      width: 80,
    });
    expect(res.status).toBe(201);
    expect(Block.create).toHaveBeenCalledWith({
      workspaceId: "workspaceId",
      userId: undefined,
      type: "blockType",
      x: 0,
      y: 0,
      height: 80,
      width: 80,
      items: [],
    });
    expect(User.updateOne).toHaveBeenCalled();
  });

  it("fails to create a block if an error is thrown", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (Block.create as jest.Mock).mockImplementation(() => {
      throw new Error();
    });
    const res = await request(app).post("/blocks").send({
      workspaceId: "workspaceId",
      type: "blockType",
      x: 0,
      y: 0,
    });
    expect(res.status).toBe(500);
  });

  it("gets sticky note blocks", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (Block.find as jest.Mock).mockImplementation(() => ({
      lean: jest.fn(() => [
        {
          _id: new ObjectId("0000aaaa1111bbbb2222cccc"),
          workspaceId: "workspaceId",
          userId: "userId",
          type: "sticky",
          x: 0,
          y: 0,
          width: 80,
          height: 80,
          __v: 0,
        },
      ]),
    }));
    const res = await request(app).get("/blocks/workspaceId");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        _id: "0000aaaa1111bbbb2222cccc",
        workspaceId: "workspaceId",
        type: "sticky",
        x: 0,
        y: 0,
        width: 80,
        height: 80,
        stickyText: "sticky note text",
      },
    ]);
    expect(Block.find).toHaveBeenCalledWith({
      workspaceId: "workspaceId",
      userId: undefined,
    });
    expect(StickyNote.find).toHaveBeenCalledWith({
      blockId: "0000aaaa1111bbbb2222cccc",
    });
  });

  it("gets resource blocks", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (Block.find as jest.Mock).mockImplementation(() => ({
      lean: jest.fn(() => [
        {
          _id: new ObjectId("0000aaaa1111bbbb2222cccc"),
          workspaceId: "workspaceId",
          userId: "userId",
          type: "resource",
          x: 0,
          y: 0,
          items: [],
          __v: 0,
        },
      ]),
    }));
    const res = await request(app).get("/blocks/workspaceId");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        _id: "0000aaaa1111bbbb2222cccc",
        workspaceId: "workspaceId",
        type: "resource",
        x: 0,
        y: 0,
        items: [],
        resources: [
          {
            _id: "0000aaaa1111bbbb2222dddd",
            blockId: "0000aaaa1111bbbb2222cccc",
            name: "resourceName",
          },
        ],
      },
    ]);
    expect(Block.find).toHaveBeenCalledWith({
      workspaceId: "workspaceId",
      userId: undefined,
    });
    expect(Resource.find).toHaveBeenCalledWith({
      blockId: "0000aaaa1111bbbb2222cccc",
    });
  });

  it("gets project blocks", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (Block.find as jest.Mock).mockImplementation(() => ({
      lean: jest.fn(() => [
        {
          _id: new ObjectId("0000aaaa1111bbbb2222cccc"),
          workspaceId: "workspaceId",
          userId: "userId",
          type: "project",
          x: 0,
          y: 0,
          items: ["0000aaaa1111bbbb2222dddd", "0000aaaa1111bbbb2222eeee"],
          __v: 0,
        },
      ]),
    }));
    const res = await request(app).get("/blocks/workspaceId");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        _id: "0000aaaa1111bbbb2222cccc",
        workspaceId: "workspaceId",
        type: "project",
        x: 0,
        y: 0,
        items: ["0000aaaa1111bbbb2222dddd", "0000aaaa1111bbbb2222eeee"],
        projects: [
          {
            _id: "0000aaaa1111bbbb2222dddd",
            blockId: "0000aaaa1111bbbb2222cccc",
            name: "projectName",
            link: "projectLink",
            image: "projectImage",
          },
          {
            _id: "0000aaaa1111bbbb2222eeee",
            blockId: "0000aaaa1111bbbb2222cccc",
            name: "projectName",
            link: "projectLink",
            image: "projectImage",
          },
        ],
      },
    ]);
    expect(Block.find).toHaveBeenCalledWith({
      workspaceId: "workspaceId",
      userId: undefined,
    });
    expect(Project.find).toHaveBeenCalledWith({
      blockId: "0000aaaa1111bbbb2222cccc",
    });
  });

  it("fails to get blocks if an error is thrown", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (Block.find as jest.Mock).mockImplementation(() => {
      throw new Error();
    });
    const res = await request(app).get("/blocks/workspaceId");
    expect(res.status).toBe(500);
  });

  it("updates a block", async () => {
    const res = await request(app)
      .patch("/blocks/blockId")
      .send({ x: 0, y: 0, width: 80, height: 80, items: [] });
    expect(res.status).toBe(204);
    expect(Block.findOne).toHaveBeenCalledWith({ _id: "blockId" });
    expect(Block.updateOne).toHaveBeenCalledWith(
      { _id: "blockId" },
      { x: 0, y: 0, width: 80, height: 80, items: [] }
    );
    expect(User.updateOne).toHaveBeenCalled();
  });

  it("fails to update a block if an error is thrown", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (Block.updateOne as jest.Mock).mockImplementation(() => {
      throw new Error();
    });
    const res = await request(app)
      .patch("/blocks/blockId")
      .send({ x: 0, y: 0 });
    expect(res.status).toBe(500);
  });

  it("deletes a block", async () => {
    const res = await request(app).delete("/blocks/blockId");
    expect(res.status).toBe(204);
    expect(Block.deleteOne).toHaveBeenCalledWith({
      _id: "blockId",
    });
    expect(StickyNote.deleteMany).toHaveBeenCalledWith({
      blockId: "blockId",
    });
    expect(Resource.deleteMany).toHaveBeenCalledWith({
      blockId: "blockId",
    });
    expect(Project.deleteMany).toHaveBeenCalledWith({
      blockId: "blockId",
    });
    expect(User.updateOne).toHaveBeenCalled();
  });

  it("fails to delete a block if an error is thrown", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (Block.deleteOne as jest.Mock).mockImplementation(() => {
      throw new Error();
    });
    const res = await request(app).delete("/blocks/blockId");
    expect(res.status).toBe(500);
  });
});
