/** Unit tests for auth endpoints. Additionally, verifies that protected endpoints cannot be accessed. */

import request from "supertest";

import User from "../../db/models/auth";
import Workspace from "../../db/models/workspaces";

const app = require("../../app");
// Use mock-session to set the express-cookie session middleware.
const mockSession = require("mock-session");

// Mock Google functions.
jest.mock("../../utils", () => {
  const originalModule = jest.requireActual("../../utils");
  return {
    __esModule: true,
    ...originalModule,
    verify: jest.fn(() => ({
      sub: "userId",
      email: "userEmail",
      firstName: "User",
      lastName: "Name",
      birthdate: "2023-01-07",
    })),
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
        firstName: "User",
        lastName: "Name",
        storage: 0,
        __v: 0,
        subscriptionExpiry: Date.now() + 1000,
      },
    ]),
  })),
  create: jest.fn(),
  updateOne: jest.fn(),
}));

jest.mock("../../db/models/workspaces", () => ({
  create: jest.fn(() => ({
    _id: "workspaceId",
    userId: "userId",
    name: "Workspace 1",
    __v: 0,
  })),
}));

describe("Auth", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("logs in a user", async () => {
    const res = await request(app).post("/auth/login").send({
      credential: "credential",
    });
    expect(res.status).toBe(201);
    expect(res.body.subscriptionStatus).toBe("active");
    expect(User.find).toHaveBeenCalledWith({ _id: "userId" });
    expect(
      res.headers["set-cookie"][0].startsWith("session=;")
    ).not.toBeTruthy();
  });

  it("checks if a user does not have a subscription", async () => {
    (User.find as jest.Mock)
      .mockImplementationOnce(() => ({
        lean: jest.fn(() => []),
      }))
      .mockImplementationOnce(() => ({
        lean: jest.fn(() => [
          {
            _id: "userId",
            email: "userEmail",
            name: "userName",
            __v: 0,
            subscriptionExpiry: Date.now() - 1000,
          },
        ]),
      }));
    const res = await request(app).post("/auth/login").send({
      credential: "credential",
    });
    expect(res.status).toBe(201);
    expect(res.body.subscriptionStatus).toBe("inactive");
    expect(User.find).toHaveBeenCalledWith({ _id: "userId" });
  });

  it("creates a new user if they do not exist", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (User.find as jest.Mock)
      .mockImplementationOnce(() => ({
        lean: jest.fn(() => []),
      }))
      .mockImplementationOnce(() => ({
        lean: jest.fn(() => []),
      }));
    const res = await request(app).post("/auth/login").send({
      credential: "credential",
    });
    expect(res.status).toBe(201);
    expect(res.body.subscriptionStatus).toBe("inactive");
    expect(User.find).toHaveBeenCalledWith({ _id: "userId" });
    expect(User.create).toHaveBeenCalledWith({
      _id: "userId",
      email: "userEmail",
      firstName: "User",
      lastName: "Name",
      birthdate: "2023-01-07",
      storage: 0,
      skills: [],
      guntherSessions: 0,
      guntherEnabled: false,
    });
    expect(Workspace.create).toHaveBeenCalledWith({
      userId: "userId",
      name: "Workspace 1",
    });
  });

  it("fails to log in a user if an error is thrown", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (User.find as jest.Mock)
      .mockImplementationOnce(() => ({
        lean: jest.fn(() => [
          {
            _id: "userId",
            email: "userEmail",
            name: "userName",
            __v: 0,
            subscriptionExpiry: Date.now() + 1000,
          },
        ]),
      }))
      .mockImplementationOnce(() => {
        throw new Error();
      });
    const res = await request(app).post("/auth/login").send({
      credential: "credential",
    });
    expect(res.status).toBe(500);
  });

  it("verifies if a user is logged in", async () => {
    const cookie = mockSession("session", process.env.SESSION_SECRET, {
      userId: "userId",
    });

    const res = await request(app).post("/auth/verify").set("Cookie", [cookie]);

    expect(res.status).toBe(200);
    expect(res.body.subscriptionStatus).toBe("active");
    expect(User.find).toHaveBeenCalledWith({ _id: "userId" });
    expect(
      res.headers["set-cookie"][0].startsWith("session=;")
    ).not.toBeTruthy();
  });

  it("verifies if a user is logged in but not subscribed", async () => {
    const cookie = mockSession("session", process.env.SESSION_SECRET, {
      userId: "userId",
    });
    (User.find as jest.Mock).mockImplementation(() => ({
      lean: jest.fn(() => [
        {
          _id: "userId",
          email: "userEmail",
          name: "userName",
          __v: 0,
          subscriptionExpiry: Date.now() - 1000,
        },
      ]),
    }));

    const res = await request(app).post("/auth/verify").set("Cookie", [cookie]);

    expect(res.status).toBe(200);
    expect(res.body.subscriptionStatus).toBe("inactive");
    expect(User.find).toHaveBeenCalledWith({ _id: "userId" });
    expect(
      res.headers["set-cookie"][0].startsWith("session=;")
    ).not.toBeTruthy();
  });

  it("fails if a user is not logged in", async () => {
    const res = await request(app).post("/auth/verify");

    expect(res.status).toBe(401);
  });

  it("fails if a user does not have an account", async () => {
    const cookie = mockSession("session", process.env.SESSION_SECRET, {
      userId: "userId",
    });
    (User.find as jest.Mock).mockImplementation(() => ({
      lean: jest.fn(() => []),
    }));
    const res = await request(app).post("/auth/verify").set("Cookie", [cookie]);

    expect(res.status).toBe(401);
  });

  it("fails to verify a user if an error is thrown", async () => {
    const cookie = mockSession("session", process.env.SESSION_SECRET, {
      userId: "userId",
    });
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (User.find as jest.Mock)
      .mockImplementationOnce(() => ({
        lean: jest.fn(() => [
          {
            _id: "userId",
            email: "userEmail",
            name: "userName",
            __v: 0,
            subscriptionExpiry: Date.now() + 1000,
          },
        ]),
      }))
      .mockImplementationOnce(() => {
        throw new Error();
      });
    const res = await request(app).post("/auth/verify").set("Cookie", [cookie]);
    expect(res.status).toBe(500);
  });

  it("logs out a user", async () => {
    const res = await request(app).post("/auth/logout");
    expect(res.status).toBe(204);
    expect(res.headers["set-cookie"][0].startsWith("session=;"));
  });

  it("sends an error if a user has no more available storage", async () => {
    (User.find as jest.Mock).mockImplementation(() => ({
      lean: jest.fn(() => [
        {
          _id: "userId",
          email: "userEmail",
          name: "userName",
          storage: 10000000000,
        },
      ]),
    }));

    const res = await request(app).post("/auth/login").send({
      credential: "credential",
    });

    expect(res.status).toBe(400);
  });

  it("gets a user's information", async () => {
    const cookie = mockSession("session", process.env.SESSION_SECRET, {
      userId: "userId",
    });

    const res = await request(app).get("/auth/user").set("Cookie", [cookie]);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      _id: "userId",
      email: "userEmail",
      name: "userName",
      storage: 10000000000,
    });
  });

  it("fails to get a user's information if an error occurs", async () => {
    (User.find as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    const res = await request(app).get("/auth/user");

    expect(res.status).toBe(500);
  });
});
