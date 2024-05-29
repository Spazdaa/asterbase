/** Unit tests for user-related endpoints. */

import { type NextFunction, type Request, type Response } from "express";
import { ObjectId } from "mongodb";
import request from "supertest";

import User from "../../db/models/auth";
import Workspace from "../../db/models/workspaces";

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
jest.mock("../../db/models/auth", () => ({
  find: jest.fn(() => ({
    lean: jest.fn(() => [
      {
        _id: "userId",
        email: "userEmail",
        name: "userName",
        storage: 0,
        __v: 0,
        subscriptionExpiry: Date.now() + 1000,
      },
    ]),
  })),
  updateOne: jest.fn(),
}));
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
}));
jest.mock("../../db/models/workspaces", () => ({
  find: jest.fn(() => ({
    lean: jest.fn(() => [
      {
        _id: "workspaceId",
        userId: "userId",
        name: "Workspace 1",
        __v: 0,
      },
    ]),
  })),
}));

describe("Auth", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("verifies user storage", async () => {
    const res = await request(app).post("/auth/verifyStorage");

    expect(res.status).toBe(204);
    expect(User.updateOne).toHaveBeenCalled();
  });

  it("fails to verify if an error is thrown", async () => {
    (Workspace.find as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    const res = await request(app).post("/auth/verifyStorage");

    expect(res.status).toBe(500);
  });
});
