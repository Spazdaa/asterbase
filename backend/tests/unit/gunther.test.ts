/** Unit tests for Gunther AI endpoints. Authentication and database connections are mocked. */

import { type NextFunction, type Request, type Response } from "express";
import { ObjectId } from "mongodb";
import request from "supertest";

import User from "../../db/models/auth";

const app = require("../../app");
// Use mock-session to set the express-cookie session middleware.
const mockSession = require("mock-session");

// Skip authentication middleware and OpenAI API calls.
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
    createAICompletion: jest.fn(() => "completion"),
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
        _id: new ObjectId("0000aaaa1111bbbb2222cccc"),
        guntherSessions: 15,
        guntherEnabled: true,
        __v: 0,
      },
    ]),
  })),
  updateOne: jest.fn(),
}));

describe("Gunther AI", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("creates a follow up request", async () => {
    const cookie = mockSession("session", process.env.SESSION_SECRET, {
      userId: "userId",
    });

    const res = await request(app)
      .post("/gunther/followup")
      .set("Cookie", [cookie])
      .send({ topic: "topic", explanation: "explanation" });

    expect(res.status).toBe(200);
    expect(res.text).toEqual("completion");
    expect(User.find).toHaveBeenCalledWith({
      _id: "userId",
    });
  });

  it("fails to create a follow up request if user has no quota", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (User.find as jest.Mock).mockImplementation(() => ({
      lean: jest.fn(() => [
        {
          _id: new ObjectId("0000aaaa1111bbbb2222cccc"),
          guntherSessions: 0,
          guntherEnabled: false,
          __v: 0,
        },
      ]),
    }));

    const res = await request(app).post("/gunther/followup");

    expect(res.status).toBe(400);
  });

  it("fails to create a follow up request if an error is thrown", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    // First mock the call that checks a user storage.
    (User.find as jest.Mock).mockImplementationOnce(() => ({
      lean: jest.fn(() => []),
    }));
    (User.find as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    const res = await request(app).post("/gunther/followup");

    expect(res.status).toBe(500);
  });

  it("creates a gaps request", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (User.find as jest.Mock).mockImplementation(() => ({
      lean: jest.fn(() => [
        {
          _id: new ObjectId("0000aaaa1111bbbb2222cccc"),
          guntherSessions: 15,
          guntherEnabled: true,
          __v: 0,
        },
      ]),
    }));
    const cookie = mockSession("session", process.env.SESSION_SECRET, {
      userId: "userId",
    });

    const res = await request(app)
      .post("/gunther/gaps")
      .set("Cookie", [cookie])
      .send({
        topic: "topic",
        explanation: "explanation",
        questions: "questions",
        responses: "responses",
      });

    expect(res.status).toBe(200);
    expect(res.text).toEqual("completion");
    expect(User.find).toHaveBeenCalledWith({
      _id: "userId",
    });
  });

  it("fails to create a gaps request if user has no quota", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (User.find as jest.Mock).mockImplementation(() => ({
      lean: jest.fn(() => [
        {
          _id: new ObjectId("0000aaaa1111bbbb2222cccc"),
          guntherSessions: 0,
          guntherEnabled: false,
          __v: 0,
        },
      ]),
    }));

    const res = await request(app).post("/gunther/gaps");

    expect(res.status).toBe(400);
  });

  it("fails to create a gaps request if an error is thrown", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    // First mock the call that checks a user storage.
    (User.find as jest.Mock).mockImplementationOnce(() => ({
      lean: jest.fn(() => []),
    }));
    (User.find as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    const res = await request(app).post("/gunther/gaps");

    expect(res.status).toBe(500);
  });

  it("starts a gunther session", async () => {
    const cookie = mockSession("session", process.env.SESSION_SECRET, {
      userId: "userId",
    });
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (User.find as jest.Mock).mockImplementation(() => ({
      lean: jest.fn(() => [
        {
          _id: new ObjectId("0000aaaa1111bbbb2222cccc"),
          guntherSessions: 15,
          guntherEnabled: true,
          __v: 0,
        },
      ]),
    }));

    const res = await request(app).post("/gunther").set("Cookie", [cookie]);

    expect(res.status).toBe(204);
    expect(User.find).toHaveBeenCalledWith({
      _id: "userId",
    });
    expect(User.updateOne).toHaveBeenCalledWith(
      { _id: "userId" },
      { $inc: { guntherSessions: -1 } }
    );
  });

  it("locks a user's gunther sessions if out of quota", async () => {
    const cookie = mockSession("session", process.env.SESSION_SECRET, {
      userId: "userId",
    });
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (User.find as jest.Mock).mockImplementation(() => ({
      lean: jest.fn(() => [
        {
          _id: new ObjectId("0000aaaa1111bbbb2222cccc"),
          guntherSessions: 0,
          guntherEnabled: true,
          __v: 0,
        },
      ]),
    }));

    const res = await request(app).post("/gunther").set("Cookie", [cookie]);

    expect(res.status).toBe(204);
    expect(User.find).toHaveBeenCalledWith({
      _id: "userId",
    });
    expect(User.updateOne).toHaveBeenCalledWith(
      { _id: "userId" },
      {
        customerId: undefined,
        subscriptionId: undefined,
        subscriptionExpiry: undefined,
        guntherSessions: 0,
        guntherEnabled: false,
      }
    );
  });

  it("fails to start a gunther session if an error is thrown", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (User.updateOne as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    const res = await request(app).post("/gunther");

    expect(res.status).toBe(500);
  });

  it("gets the number of remaining gunther sessions", async () => {
    const cookie = mockSession("session", process.env.SESSION_SECRET, {
      userId: "userId",
    });
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (User.find as jest.Mock).mockImplementation(() => ({
      lean: jest.fn(() => [
        {
          _id: new ObjectId("0000aaaa1111bbbb2222cccc"),
          guntherSessions: 15,
          guntherEnabled: true,
          __v: 0,
        },
      ]),
    }));

    const res = await request(app).get("/gunther").set("Cookie", [cookie]);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ sessions: 15 });
    expect(User.find).toHaveBeenCalledWith({
      _id: "userId",
    });
  });

  it("fails to get the number of remaining gunther sessions if an error is thrown", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (User.find as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    const res = await request(app).get("/gunther");

    expect(res.status).toBe(500);
  });
});
