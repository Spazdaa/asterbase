/** Unit tests for resource endpoints. Authentication and database connections are mocked. */

import { type NextFunction, type Request, type Response } from "express";
import { ObjectId } from "mongodb";
import multer from "multer";
import request from "supertest";

import { bucket } from "../../db/db";
import User from "../../db/models/auth";
import Block from "../../db/models/blocks";
import Resource from "../../db/models/resources";

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
        filename: "resourceImageName",
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
jest.mock("../../db/models/resources", () => ({
  find: jest.fn(() => ({
    lean: jest.fn(() => [
      {
        _id: new ObjectId("0000aaaa1111bbbb2222cccc"),
        blockId: "blockId",
        name: "resourceName",
        imageId: "resourceImageId",
        imageName: "resourceImageName",
        notes: "resourceNotes",
        __v: 0,
      },
    ]),
  })),
  findOne: jest.fn(() => ({
    lean: jest.fn(() => ({
      _id: new ObjectId("0000aaaa1111bbbb2222cccc"),
      blockId: "blockId",
      name: "resourceName",
      imageId: undefined,
      imageName: undefined,
      notes: undefined,
      __v: 0,
    })),
  })),
  create: jest.fn(() => ({
    _id: new ObjectId("0000aaaa1111bbbb2222cccc"),
    blockId: "blockId",
    name: "resourceName",
    imageId: "resourceImageId",
    imageName: "resourceImageName",
    notes: "resourceNotes",
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

describe("Resources", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("creates a resource", async () => {
    const res = await request(app)
      .post("/resources")
      .field("blockId", "blockId")
      .field("name", "resourceName")
      .field("notes", "resourceNotes")
      .attach("resource-image", "tests/mockData/testImage.png");

    expect(res.status).toBe(201);
    expect(Resource.create).toHaveBeenCalledWith({
      blockId: "blockId",
      name: "resourceName",
      // Not actually testing the image here, since this would require the database connection.
      imageId: undefined,
      imageName: "testImage.png",
      notes: "resourceNotes",
    });
    expect(Block.updateOne).toHaveBeenCalledWith(
      { _id: "blockId" },
      { $push: { items: "0000aaaa1111bbbb2222cccc" } }
    );
    expect(User.updateOne).toHaveBeenCalled();
  });

  it("creates a resource with minimal information", async () => {
    const res = await request(app)
      .post("/resources")
      .field("blockId", "blockId")
      .field("name", "resourceName");

    expect(res.status).toBe(201);
    expect(Resource.create).toHaveBeenCalledWith({
      blockId: "blockId",
      name: "resourceName",
      imageId: undefined,
      imageName: undefined,
      notes: undefined,
    });
    expect(Block.updateOne).toHaveBeenCalledWith(
      { _id: "blockId" },
      { $push: { items: "0000aaaa1111bbbb2222cccc" } }
    );
    expect(User.updateOne).toHaveBeenCalled();
  });

  it("fails to create a resource if an error is thrown", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (Resource.create as jest.Mock).mockImplementation(() => {
      throw new Error();
    });
    const res = await request(app)
      .post("/resources")
      .field("blockId", "blockId")
      .field("name", "resourceName");
    expect(res.status).toBe(500);
  });

  it("gets resources", async () => {
    const res = await request(app).get("/resources/blockId");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        _id: "0000aaaa1111bbbb2222cccc",
        blockId: "blockId",
        name: "resourceName",
        imageId: "resourceImageId",
        imageName: "resourceImageName",
        notes: "resourceNotes",
      },
    ]);
    expect(Resource.find).toHaveBeenCalledWith({ blockId: "blockId" });
  });

  it("fails to get resources if an error is thrown", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (Resource.find as jest.Mock).mockImplementation(() => {
      throw new Error();
    });
    const res = await request(app).get("/resources/blockId");
    expect(res.status).toBe(500);
  });

  it("gets resource image", async () => {
    const res = await request(app).get(
      "/resources/images/0000aaaa1111bbbb2222dddd"
    );
    expect(res.status).toBe(200);
    expect(bucket.openDownloadStream).toHaveBeenCalledWith(
      new ObjectId("0000aaaa1111bbbb2222dddd")
    );
  });

  it("fails to get resource image if an error is thrown", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (bucket.openDownloadStream as jest.Mock).mockImplementation(() => {
      throw new Error();
    });
    const res = await request(app).get(
      "/resources/images/0000aaaa1111bbbb2222dddd"
    );
    expect(res.status).toBe(500);
  });

  it("updates a resource", async () => {
    const res = await request(app)
      .patch("/resources/resourceId")
      .field("name", "newResourceName");

    expect(res.status).toBe(204);
    expect(Resource.findOne).toHaveBeenCalledWith({
      _id: "resourceId",
    });
    expect(Resource.updateOne).toHaveBeenCalledWith(
      { _id: "resourceId" },
      { name: "newResourceName" }
    );
    expect(User.updateOne).toHaveBeenCalled();
  });

  it("fails to update a resource if an error is thrown", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (Resource.updateOne as jest.Mock).mockImplementation(() => {
      throw new Error();
    });
    const res = await request(app)
      .patch("/resources/resourceId")
      .field("name", "newResourceName");
    expect(res.status).toBe(500);
  });

  it("deletes a resource", async () => {
    const res = await request(app).delete("/resources/resourceId");

    expect(res.status).toBe(204);
    expect(Resource.findOne).toHaveBeenCalledWith({
      _id: "resourceId",
    });
    expect(Resource.deleteOne).toHaveBeenCalledWith({
      _id: "resourceId",
    });
    expect(Block.updateOne).toHaveBeenCalledWith(
      { _id: "blockId" },
      { $pull: { items: "resourceId" } }
    );
    expect(User.updateOne).toHaveBeenCalled();
  });

  it("fails to delete a resource if an error is thrown", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (Resource.deleteOne as jest.Mock).mockImplementation(() => {
      throw new Error();
    });
    const res = await request(app).delete("/resources/resourceId");
    expect(res.status).toBe(500);
  });
});
