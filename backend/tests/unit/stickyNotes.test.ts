/** Unit tests for sticky note endpoints. Authentication and database connections are mocked. */

import { type NextFunction, type Request, type Response } from "express";
import { ObjectId } from "mongodb";
import request from "supertest";

import User from "../../db/models/auth";
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
jest.mock("../../db/models/stickyNotes", () => ({
  find: jest.fn(() => ({
    lean: jest.fn(() => [
      {
        _id: new ObjectId("0000aaaa1111bbbb2222cccc"),
        blockId: "blockId",
        text: "sticky note text",
        __v: 0,
      },
    ]),
  })),
  findOne: jest.fn(() => ({
    lean: jest.fn(() => ({
      _id: new ObjectId("0000aaaa1111bbbb2222cccc"),
      blockId: "blockId",
      text: "new sticky note text",
      __v: 0,
    })),
  })),
  create: jest.fn(() => ({
    _id: new ObjectId("0000aaaa1111bbbb2222cccc"),
    blockId: "blockId",
    text: "sticky note text",
    __v: 0,
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

describe("Sticky notes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("creates a sticky note", async () => {
    const res = await request(app).post("/stickyNotes").send({
      blockId: "blockId",
      text: "sticky note text",
    });

    expect(res.status).toBe(201);
    expect(StickyNote.create).toHaveBeenCalledWith({
      blockId: "blockId",
      text: "sticky note text",
    });
    expect(User.updateOne).toHaveBeenCalled();
  });

  it("fails to create a sticky note if an error is thrown", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (StickyNote.create as jest.Mock).mockImplementation(() => {
      throw new Error();
    });
    const res = await request(app).post("/stickyNotes").send({
      blockId: "blockId",
      text: "sticky note text",
    });
    expect(res.status).toBe(500);
  });

  it("gets a sticky note", async () => {
    const res = await request(app).get("/stickyNotes/blockId");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      _id: "0000aaaa1111bbbb2222cccc",
      blockId: "blockId",
      text: "sticky note text",
    });
    expect(StickyNote.find).toHaveBeenCalledWith({ blockId: "blockId" });
  });

  it("fails to get a sticky note if an error is thrown", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (StickyNote.find as jest.Mock).mockImplementation(() => {
      throw new Error();
    });
    const res = await request(app).get("/stickyNotes/blockId");
    expect(res.status).toBe(500);
  });

  it("updates a sticky note", async () => {
    (StickyNote.find as jest.Mock).mockImplementation(() => ({
      lean: jest.fn(() => ({
        _id: "stickyNoteId",
        text: "sticky note text",
      })),
    }));
    const res = await request(app).patch("/stickyNotes/stickyNoteId").send({
      text: "new sticky note text",
    });
    expect(res.status).toBe(204);
    expect(StickyNote.findOne).toHaveBeenCalledWith({
      blockId: "stickyNoteId",
    });
    expect(StickyNote.updateOne).toHaveBeenCalledWith(
      { blockId: "stickyNoteId" },
      { text: "new sticky note text" },
      { upsert: true }
    );
    expect(User.updateOne).toHaveBeenCalled();
  });

  it("fails to update a sticky note if an error is thrown", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (StickyNote.updateOne as jest.Mock).mockImplementation(() => {
      throw new Error();
    });
    const res = await request(app).patch("/stickyNotes/stickyNoteId").send({
      text: "new sticky note text",
    });
    expect(res.status).toBe(500);
  });

  it("deletes a sticky note", async () => {
    const res = await request(app).delete("/stickyNotes/stickyNoteId");
    expect(res.status).toBe(204);
    expect(StickyNote.deleteOne).toHaveBeenCalledWith({
      blockId: "stickyNoteId",
    });
    expect(User.updateOne).toHaveBeenCalled();
  });

  it("fails to delete a sticky note if an error is thrown", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (StickyNote.deleteOne as jest.Mock).mockImplementation(() => {
      throw new Error();
    });
    const res = await request(app).delete("/stickyNotes/stickyNoteId");
    expect(res.status).toBe(500);
  });
});
