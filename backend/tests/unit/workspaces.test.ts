/** Unit tests for workspace endpoints. Authentication and database connections are mocked. */

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
jest.mock("../../db/models/workspaces", () => ({
  find: jest.fn(() => ({
    lean: jest.fn(() => [
      {
        _id: new ObjectId("0000aaaa1111bbbb2222cccc"),
        userId: "userId",
        name: "Workspace 1",
        __v: 0,
      },
    ]),
  })),
  create: jest.fn(() => ({
    _id: new ObjectId("0000aaaa1111bbbb2222cccc"),
    userId: "userId",
    name: "Workspace 1",
    __v: 0,
  })),
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

describe("Workspaces", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("creates a workspace", async () => {
    const res = await request(app)
      .post("/workspaces")
      .send({ name: "Workspace 1" });

    expect(res.status).toBe(201);
    expect(Workspace.create).toHaveBeenCalledWith({
      userId: undefined,
      name: "Workspace 1",
    });
    expect(User.updateOne).toHaveBeenCalled();
  });

  it("fails to create a workspace if an error is thrown", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (Workspace.create as jest.Mock).mockImplementation(() => {
      throw new Error();
    });
    const res = await request(app).post("/workspaces").send({
      name: "Workspace 1",
    });
    expect(res.status).toBe(500);
  });

  it("gets workspaces for a user", async () => {
    const res = await request(app).get("/workspaces");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        _id: "0000aaaa1111bbbb2222cccc",
        userId: "userId",
        name: "Workspace 1",
      },
    ]);
    expect(Workspace.find).toHaveBeenCalled();
  });

  it("fails to get workspaces if an error is thrown", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (Workspace.find as jest.Mock).mockImplementation(() => {
      throw new Error();
    });
    const res = await request(app).get("/workspaces");
    expect(res.status).toBe(500);
  });
});
