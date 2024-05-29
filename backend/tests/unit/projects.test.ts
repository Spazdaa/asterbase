/** Unit tests for project endpoints. Authentication and database connections are mocked. */

import { type NextFunction, type Request, type Response } from "express";
import { ObjectId } from "mongodb";
import multer from "multer";
import request from "supertest";

import { bucket } from "../../db/db";
import User from "../../db/models/auth";
import Block from "../../db/models/blocks";
import Project from "../../db/models/projects";

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
    // Use memory storage instead of database storage for unit tests.
    imageUpload: multer({ storage: multer.memoryStorage() }),
  };
});

// Mock database connection.
jest.mock("../../db/db", () => ({
  connect: jest.fn(),
  bucket: {
    find: jest.fn(() => ({
      next: jest.fn(() => ({
        _id: new ObjectId("0000aaaa1111bbbb2222dddd"),
        filename: "projectImageName",
        length: 100,
      })),
    })),
    openDownloadStream: jest.fn((imageId: string) => ({
      pipe: jest.fn((res: Response) => res.status(200).end()),
      on: jest.fn(),
    })),
  },
}));

// Mock database functions.
jest.mock("../../db/models/projects", () => ({
  find: jest.fn(() => ({
    lean: jest.fn(() => [
      {
        _id: new ObjectId("0000aaaa1111bbbb2222cccc"),
        blockId: "blockId",
        name: "projectName",
        imageId: "projectImageId",
        imageName: "projectImageName",
        description: "projectDescription",
        notes: "projectNotes",
        __v: 0,
      },
    ]),
  })),
  findOne: jest.fn(() => ({
    lean: jest.fn(() => ({
      _id: new ObjectId("0000aaaa1111bbbb2222cccc"),
      blockId: "blockId",
      name: "projectName",
      imageId: undefined,
      imageName: undefined,
      description: "projectDescription",
      notes: "projectNotes",
      __v: 0,
    })),
  })),
  create: jest.fn(() => ({
    _id: new ObjectId("0000aaaa1111bbbb2222cccc"),
    blockId: "blockId",
    name: "projectName",
    imageId: "projectImageId",
    imageName: "projectImageName",
    description: "projectDescription",
    notes: "projectNotes",
  })),
  updateOne: jest.fn(),
  deleteOne: jest.fn(),
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

jest.mock("../../db/models/blocks", () => ({
  findOne: jest.fn(() => ({
    lean: jest.fn(() => ({
      _id: "blockId",
      items: [],
      __v: 0,
    })),
  })),
  updateOne: jest.fn(),
}));

describe("Projects", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("creates a project", async () => {
    const res = await request(app)
      .post("/projects")
      .field("blockId", "blockId")
      .field("name", "projectName")
      .field("description", "projectDescription")
      .field("notes", "projectNotes")
      .attach("project-image", "tests/mockData/testImage.png");
    expect(res.status).toBe(201);
    expect(Project.create).toHaveBeenCalledWith({
      blockId: "blockId",
      name: "projectName",
      // Not actually testing the image here, since this would require the database connection.
      imageId: undefined,
      imageName: "testImage.png",
      description: "projectDescription",
      notes: "projectNotes",
    });
    expect(Block.updateOne).toHaveBeenCalledWith(
      { _id: "blockId" },
      { $push: { items: "0000aaaa1111bbbb2222cccc" } }
    );
    expect(User.updateOne).toHaveBeenCalled();
  });

  it("creates a project with minimal information", async () => {
    const res = await request(app)
      .post("/projects")
      .field("blockId", "blockId")
      .field("name", "projectName");
    expect(res.status).toBe(201);
    expect(Project.create).toHaveBeenCalledWith({
      blockId: "blockId",
      name: "projectName",
      imageId: undefined,
      imageName: undefined,
      description: undefined,
      notes: undefined,
    });
    expect(Block.updateOne).toHaveBeenCalledWith(
      { _id: "blockId" },
      { $push: { items: "0000aaaa1111bbbb2222cccc" } }
    );
    expect(User.updateOne).toHaveBeenCalled();
  });

  it("fails to create a project if an error is thrown", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (Project.create as jest.Mock).mockImplementation(() => {
      throw new Error();
    });
    const res = await request(app)
      .post("/projects")
      .field("blockId", "blockId")
      .field("name", "projectName");
    expect(res.status).toBe(500);
  });

  it("gets projects", async () => {
    const res = await request(app).get("/projects/blockId");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        _id: "0000aaaa1111bbbb2222cccc",
        blockId: "blockId",
        name: "projectName",
        imageId: "projectImageId",
        imageName: "projectImageName",
        description: "projectDescription",
        notes: "projectNotes",
      },
    ]);
    expect(Project.find).toHaveBeenCalledWith({ blockId: "blockId" });
  });

  it("fails to get projects if an error is thrown", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (Project.find as jest.Mock).mockImplementation(() => {
      throw new Error();
    });
    const res = await request(app).get("/projects/blockId");
    expect(res.status).toBe(500);
  });

  it("gets project image", async () => {
    const res = await request(app).get(
      "/projects/images/0000aaaa1111bbbb2222dddd"
    );
    expect(res.status).toBe(200);
    expect(bucket.openDownloadStream).toHaveBeenCalledWith(
      new ObjectId("0000aaaa1111bbbb2222dddd")
    );
  });

  it("fails to get project image if an error is thrown", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (bucket.openDownloadStream as jest.Mock).mockImplementation(() => {
      throw new Error();
    });
    const res = await request(app).get(
      "/projects/images/0000aaaa1111bbbb2222dddd"
    );
    expect(res.status).toBe(500);
  });

  it("updates a project", async () => {
    const res = await request(app)
      .patch("/projects/projectId")
      .field("name", "newProjectName");
    expect(res.status).toBe(204);
    expect(Project.findOne).toHaveBeenCalledWith({
      _id: "projectId",
    });
    expect(Project.updateOne).toHaveBeenCalledWith(
      { _id: "projectId" },
      {
        name: "newProjectName",
      }
    );
    expect(User.updateOne).toHaveBeenCalled();
  });

  it("fails to update a project if an error is thrown", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (Project.updateOne as jest.Mock).mockImplementation(() => {
      throw new Error();
    });
    const res = await request(app)
      .patch("/projects/projectId")
      .field("name", "newProjectName");
    expect(res.status).toBe(500);
  });

  it("deletes a project", async () => {
    const res = await request(app).delete("/projects/projectId");
    expect(res.status).toBe(204);
    expect(Project.findOne).toHaveBeenCalledWith({
      _id: "projectId",
    });
    expect(Project.deleteOne).toHaveBeenCalledWith({
      _id: "projectId",
    });
    expect(Block.updateOne).toHaveBeenCalledWith(
      { _id: "blockId" },
      { $pull: { items: "projectId" } }
    );
    expect(User.updateOne).toHaveBeenCalled();
  });

  it("fails to delete a project if an error is thrown", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (Project.deleteOne as jest.Mock).mockImplementation(() => {
      throw new Error();
    });
    const res = await request(app).delete("/projects/projectId");
    expect(res.status).toBe(500);
  });
});
