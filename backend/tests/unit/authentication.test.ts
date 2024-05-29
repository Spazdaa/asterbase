/** Unit tests that verify that protected endpoints cannot be accessed without proper authentication. */

import request from "supertest";

const app = require("../../app");

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
        subscriptionExpiry: Date.now() + 1000,
      },
    ]),
  })),
}));

describe("Authentication protected endpoints", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Resources", () => {
    it("requires authentication to create a resource", async () => {
      const res = await request(app).post("/resources").send({
        blockId: "blockId",
        name: "resourceName",
      });
      expect(res.status).toBe(401);
    });

    it("requires authentication to get resources", async () => {
      const res = await request(app).get("/resources/blockId");
      expect(res.status).toBe(401);
    });

    it("requires authentication to update a resource", async () => {
      const res = await request(app).patch("/resources/resourceId").send({
        name: "newResourceName",
      });
      expect(res.status).toBe(401);
    });

    it("requires authentication to delete a resource", async () => {
      const res = await request(app).delete("/resources/resourceId");
      expect(res.status).toBe(401);
    });
  });

  describe("Sticky notes", () => {
    it("requires authentication to create a sticky note", async () => {
      const res = await request(app).post("/stickyNotes").send({
        blockId: "blockId",
        text: "sticky note text",
      });
      expect(res.status).toBe(401);
    });

    it("requires authentication to get sticky notes", async () => {
      const res = await request(app).get("/stickyNotes/blockId");
      expect(res.status).toBe(401);
    });

    it("requires authentication to update a sticky note", async () => {
      const res = await request(app).patch("/stickyNotes/stickyNoteId").send({
        content: "new sticky note content",
      });
      expect(res.status).toBe(401);
    });

    it("requires authentication to delete a sticky note", async () => {
      const res = await request(app).delete("/stickyNotes/stickyNoteId");
      expect(res.status).toBe(401);
    });
  });

  describe("Projects", () => {
    it("requires authentication to create a project", async () => {
      const res = await request(app).post("/projects").send({
        name: "projectName",
      });
      expect(res.status).toBe(401);
    });

    it("requires authentication to get projects", async () => {
      const res = await request(app).get("/projects");
      expect(res.status).toBe(401);
    });

    it("requires authentication to update a project", async () => {
      const res = await request(app).patch("/projects/projectId").send({
        name: "newProjectName",
      });
      expect(res.status).toBe(401);
    });

    it("requires authentication to delete a project", async () => {
      const res = await request(app).delete("/projects/projectId");
      expect(res.status).toBe(401);
    });
  });

  describe("Blocks", () => {
    it("requires authentication to create a block", async () => {
      const res = await request(app).post("/blocks").send({
        workspaceId: "workspaceId",
        type: "blockType",
      });
      expect(res.status).toBe(401);
    });

    it("requires authentication to get blocks", async () => {
      const res = await request(app).get("/blocks");
      expect(res.status).toBe(401);
    });

    it("requires authentication to delete a block", async () => {
      const res = await request(app).delete("/blocks/blockId");
      expect(res.status).toBe(401);
    });
  });
});
