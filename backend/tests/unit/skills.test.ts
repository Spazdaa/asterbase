/** Unit tests for skill endpoints. Authentication and database connections are mocked. */

import { type NextFunction, type Request, type Response } from "express";
import { ObjectId } from "mongodb";
import multer from "multer";
import request from "supertest";

import { bucket } from "../../db/db";
import User from "../../db/models/auth";
import Skill from "../../db/models/skills";

const app = require("../../app");
// Use mock-session to set the express-cookie session middleware.
const mockSession = require("mock-session");

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
    openDownloadStream: jest.fn((imageId: string) => ({
      pipe: jest.fn((res: Response) => res.status(200).end()),
      on: jest.fn(),
    })),
  },
}));

// Mock database functions.
jest.mock("../../db/models/skills", () => ({
  find: jest.fn(() => ({
    lean: jest.fn(() => [
      {
        _id: new ObjectId("0000aaaa1111bbbb2222cccc"),
        name: "skillName",
        bgColour: "bg-red-300",
        textColour: "text-red-400",
        imageId: "skillImageId",
        __v: 0,
      },
    ]),
  })),
  findOne: jest.fn(() => ({
    lean: jest.fn(() => ({
      _id: new ObjectId("0000aaaa1111bbbb2222cccc"),
      name: "skillName",
      __v: 0,
    })),
  })),
  create: jest.fn(() => ({
    _id: new ObjectId("0000aaaa1111bbbb2222cccc"),
    name: "skillName",
    bgColour: "bg-red-300",
    textColour: "text-red-400",
    imageId: "skillImageId",
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
        skills: ["0000aaaa1111bbbb2222cccc"],
        __v: 0,
      },
    ]),
  })),
  findOne: jest.fn(() => ({
    lean: jest.fn(() => ({
      _id: new ObjectId("0000aaaa1111bbbb2222cccc"),
      storage: 0,
      skills: ["0000aaaa1111bbbb2222cccc"],
      __v: 0,
    })),
  })),
  updateOne: jest.fn(),
}));

describe("Skills", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("creates a skill", async () => {
    const res = await request(app)
      .post("/skills")
      .field("name", "skillName")
      .field("bgColour", "bg-red-300")
      .field("textColour", "text-red-400")
      .attach("skill-image", "tests/mockData/testImage.png");

    expect(res.status).toBe(201);
    expect(Skill.create).toHaveBeenCalledWith({
      name: "skillName",
      bgColour: "bg-red-300",
      textColour: "text-red-400",
      // Not actually testing the image here, since this would require the database connection.
      imageId: undefined,
    });
  });

  it("fails to create a skill if an error is thrown", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (Skill.create as jest.Mock).mockImplementation(() => {
      throw new Error();
    });
    const res = await request(app).post("/skills").field("name", "skillName");
    expect(res.status).toBe(500);
  });

  it("gets skills", async () => {
    const res = await request(app).get("/skills");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        _id: "0000aaaa1111bbbb2222cccc",
        name: "skillName",
        bgColour: "bg-red-300",
        textColour: "text-red-400",
        imageId: "skillImageId",
      },
    ]);
    expect(Skill.find).toHaveBeenCalled();
  });

  it("fails to get skills if an error is thrown", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (Skill.find as jest.Mock).mockImplementation(() => {
      throw new Error();
    });
    const res = await request(app).get("/skills");
    expect(res.status).toBe(500);
  });

  it("gets skill image", async () => {
    const res = await request(app).get(
      "/skills/images/0000aaaa1111bbbb2222dddd"
    );
    expect(res.status).toBe(200);
    expect(bucket.openDownloadStream).toHaveBeenCalledWith(
      new ObjectId("0000aaaa1111bbbb2222dddd")
    );
  });

  it("fails to get skill image if an error is thrown", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (bucket.openDownloadStream as jest.Mock).mockImplementation(() => {
      throw new Error();
    });
    const res = await request(app).get(
      "/skills/images/0000aaaa1111bbbb2222dddd"
    );
    expect(res.status).toBe(500);
  });

  it("updates a skill", async () => {
    const res = await request(app)
      .patch("/skills/skillId")
      .field("name", "newSkillName");

    expect(res.status).toBe(204);
    expect(Skill.findOne).toHaveBeenCalledWith({
      _id: "skillId",
    });
    expect(Skill.updateOne).toHaveBeenCalledWith(
      { _id: "skillId" },
      { name: "newSkillName" }
    );
  });

  it("fails to update a skill if an error is thrown", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (Skill.updateOne as jest.Mock).mockImplementation(() => {
      throw new Error();
    });
    const res = await request(app)
      .patch("/skills/skillId")
      .field("name", "newSkillName");
    expect(res.status).toBe(500);
  });

  it("deletes a skill", async () => {
    const res = await request(app).delete("/skills/skillId");

    expect(res.status).toBe(204);
    expect(Skill.findOne).toHaveBeenCalledWith({
      _id: "skillId",
    });
    expect(Skill.deleteOne).toHaveBeenCalledWith({
      _id: "skillId",
    });
  });

  it("fails to delete a skill if an error is thrown", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (Skill.deleteOne as jest.Mock).mockImplementation(() => {
      throw new Error();
    });
    const res = await request(app).delete("/skills/skillId");
    expect(res.status).toBe(500);
  });

  it("adds a skill to a user", async () => {
    const cookie = mockSession("session", process.env.SESSION_SECRET, {
      userId: "userId",
    });
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (Skill.updateOne as jest.Mock).mockImplementation(jest.fn());

    const res = await request(app)
      .post("/skills/users/skillId")
      .set("Cookie", [cookie]);

    expect(res.status).toBe(204);
    expect(User.find).toHaveBeenCalledWith({ _id: "userId" });
    expect(User.updateOne).toHaveBeenCalledWith(
      { _id: "userId" },
      { $addToSet: { skills: "skillId" } }
    );
    expect(Skill.updateOne).toHaveBeenCalledWith(
      { _id: "skillId" },
      { $inc: { count: 1 } }
    );
  });

  it("fails to add a skill to a user if an error is thrown", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (User.updateOne as jest.Mock).mockImplementation(() => {
      throw new Error();
    });
    const res = await request(app).post("/skills/users/skillId");
    expect(res.status).toBe(500);
  });

  it("gets a user's skills", async () => {
    const cookie = mockSession("session", process.env.SESSION_SECRET, {
      userId: "userId",
    });
    const res = await request(app).get("/skills/users").set("Cookie", [cookie]);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(["0000aaaa1111bbbb2222cccc"]);
    expect(User.find).toHaveBeenCalledWith({ _id: "userId" });
  });

  it("fails to get a user's skills if an error is thrown", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (User.find as jest.Mock).mockImplementation(() => {
      throw new Error();
    });
    const res = await request(app).get("/skills/users");
    expect(res.status).toBe(500);
  });

  it("removes a user's skill", async () => {
    const cookie = mockSession("session", process.env.SESSION_SECRET, {
      userId: "userId",
    });
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (User.find as jest.Mock).mockImplementation(() => ({
      lean: jest.fn(() => [
        {
          _id: "userId",
          skills: ["skillId"],
          __v: 0,
        },
      ]),
    }));
    (User.updateOne as jest.Mock).mockImplementation(jest.fn());

    const res = await request(app)
      .delete("/skills/users/skillId")
      .set("Cookie", [cookie]);

    expect(res.status).toBe(204);
    expect(User.find).toHaveBeenCalledWith({ _id: "userId" });
    expect(User.updateOne).toHaveBeenCalledWith(
      { _id: "userId" },
      { $pull: { skills: "skillId" } }
    );
    expect(Skill.updateOne).toHaveBeenCalledWith(
      { _id: "skillId" },
      { $inc: { count: -1 } }
    );
  });

  it("fails to remove a user's skill if an error is thrown", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (User.updateOne as jest.Mock).mockImplementation(() => {
      throw new Error();
    });
    const res = await request(app).delete("/skills/users/skillId");
    expect(res.status).toBe(500);
  });

  it("gets the count for a skill", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (Skill.find as jest.Mock).mockImplementation(() => ({
      lean: jest.fn(() => [
        {
          _id: new ObjectId("0000aaaa1111bbbb2222cccc"),
          name: "skillName",
          count: 1,
          __v: 0,
        },
      ]),
    }));

    const res = await request(app).get("/skills/count");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        _id: "0000aaaa1111bbbb2222cccc",
        name: "skillName",
        count: 1,
      },
    ]);
    expect(Skill.find).toHaveBeenCalled();
  });

  it("fails to get the count for a skill if an error is thrown", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (Skill.find as jest.Mock).mockImplementation(() => {
      throw new Error();
    });
    const res = await request(app).get("/skills/count");
    expect(res.status).toBe(500);
  });
});
