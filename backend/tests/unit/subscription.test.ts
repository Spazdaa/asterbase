/** Unit tests that verify that protected endpoints cannot be accessed without a subscription. */

import { type NextFunction, type Request, type Response } from "express";
import request from "supertest";

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
        __v: 0,
        subscriptionExpiry: Date.now() - 1000,
      },
    ]),
  })),
  create: jest.fn(),
}));

describe("Subscription protected endpoints", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Resources", () => {
    it("requires a subscription to create a resource", async () => {
      const res = await request(app).post("/resources").send({
        blockId: "blockId",
        name: "resourceName",
      });
      expect(res.status).toBe(402);
    });

    it("requires a subscription to get resources", async () => {
      const res = await request(app).get("/resources/blockId");
      expect(res.status).toBe(402);
    });

    it("requires a subscription to update a resource", async () => {
      const res = await request(app).patch("/resources/resourceId").send({
        name: "newResourceName",
      });
      expect(res.status).toBe(402);
    });

    it("requires a subscription to delete a resource", async () => {
      const res = await request(app).delete("/resources/resourceId");
      expect(res.status).toBe(402);
    });
  });

  describe("Sticky notes", () => {
    it("requires a subscription to create a sticky note", async () => {
      const res = await request(app).post("/stickyNotes").send({
        blockId: "blockId",
        text: "sticky note text",
      });
      expect(res.status).toBe(402);
    });

    it("requires a subscription to get sticky notes", async () => {
      const res = await request(app).get("/stickyNotes/blockId");
      expect(res.status).toBe(402);
    });

    it("requires a subscription to update a sticky note", async () => {
      const res = await request(app).patch("/stickyNotes/stickyNoteId").send({
        content: "new sticky note content",
      });
      expect(res.status).toBe(402);
    });

    it("requires a subscription to delete a sticky note", async () => {
      const res = await request(app).delete("/stickyNotes/stickyNoteId");
      expect(res.status).toBe(402);
    });
  });

  describe("Projects", () => {
    it("requires a subscription to create a project", async () => {
      const res = await request(app).post("/projects").send({
        name: "projectName",
      });
      expect(res.status).toBe(402);
    });

    it("requires a subscription to get projects", async () => {
      const res = await request(app).get("/projects");
      expect(res.status).toBe(402);
    });

    it("requires a subscription to update a project", async () => {
      const res = await request(app).patch("/projects/projectId").send({
        name: "newProjectName",
      });
      expect(res.status).toBe(402);
    });

    it("requires a subscription to delete a project", async () => {
      const res = await request(app).delete("/projects/projectId");
      expect(res.status).toBe(402);
    });
  });

  describe("Blocks", () => {
    it("requires a subscription to create a block", async () => {
      const res = await request(app).post("/blocks").send({
        workspaceId: "workspaceId",
        type: "blockType",
      });
      expect(res.status).toBe(402);
    });

    it("requires a subscription to get blocks", async () => {
      const res = await request(app).get("/blocks");
      expect(res.status).toBe(402);
    });

    it("requires a subscription to delete a block", async () => {
      const res = await request(app).delete("/blocks/blockId");
      expect(res.status).toBe(402);
    });
  });
});
