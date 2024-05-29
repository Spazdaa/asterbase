/** Unit tests for billing endpoints. */

import { type NextFunction, type Request, type Response } from "express";
import request from "supertest";

import User from "../../db/models/auth";
import {
  createStripeCheckoutSession,
  createStripeWebhookEvent,
} from "../../utils";

const app = require("../../app");

// Skip authentication middleware and stripe functions.
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
    createStripeCheckoutSession: jest.fn(() => ({
      url: "successUrl?session_id={CHECKOUT_SESSION_ID}",
    })),
    createStripeWebhookEvent: jest.fn(() => ({
      data: {
        object: {
          created: "1609459200",
          client_reference_id: "userId",
          customer: "customerId",
          subscription: "subscriptionId",
        },
      },
      type: "checkout.session.completed",
    })),
    createStripePortalSession: jest.fn(() => ({
      url: "returnUrl",
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
        name: "userName",
        __v: 0,
        subscriptionExpiry: Date.now() + 1000,
      },
    ]),
  })),
  updateOne: jest.fn(),
}));

describe("Billing", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("opens a checkout session", async () => {
    const res = await request(app).post("/billing/checkout").send({
      priceId: "priceId",
      successUrl: "successUrl",
      cancelUrl: "cancelUrl",
    });
    expect(res.status).toBe(200);
    expect(res.body.url).toBe("successUrl?session_id={CHECKOUT_SESSION_ID}");
  });

  it("fails to open a checkout session if an error is thrown", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (createStripeCheckoutSession as jest.Mock).mockImplementation(() => {
      throw new Error();
    });
    const res = await request(app).post("/billing/checkout").send({
      priceId: "priceId",
      successUrl: "successUrl",
      cancelUrl: "cancelUrl",
    });
    expect(res.status).toBe(500);
  });

  it("processes a webhook when a user pays successfully", async () => {
    const res = await request(app).post("/billing/webhook");
    expect(res.status).toBe(204);
    expect(User.updateOne).toHaveBeenCalledWith(
      { _id: "userId" },
      {
        customerId: "customerId",
        subscriptionId: "subscriptionId",
        subscriptionExpiry: new Date("2021-02-03"),
        guntherSessions: 15,
        guntherEnabled: true,
      }
    );
  });

  it("processes a webhook when a user's payment fails", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (createStripeWebhookEvent as jest.Mock).mockImplementation(() => ({
      data: {
        object: {
          created: "1609459200",
          client_reference_id: "userId",
          customer: "customerId",
          subscription: "subscriptionId",
        },
      },
      type: "invoice.payment_failed",
    }));

    const res = await request(app).post("/billing/webhook");
    expect(res.status).toBe(204);
    expect(User.updateOne).toHaveBeenCalledWith(
      { _id: "userId" },
      {
        customerId: "customerId",
        subscriptionId: "subscriptionId",
        subscriptionExpiry: undefined,
        guntherSessions: 0,
        guntherEnabled: false,
      }
    );
  });

  it("fails to process a webhook if an error is thrown", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (User.updateOne as jest.Mock).mockImplementation(() => {
      throw new Error();
    });
    const res = await request(app).post("/billing/webhook");
    expect(res.status).toBe(500);
  });

  it("fails to process a webhook if it can't create one", async () => {
    // Cast to jest.Mock for TypeScript so that we can change the mockImplementation.
    (createStripeWebhookEvent as jest.Mock).mockImplementation(() => {
      throw new Error();
    });
    const res = await request(app).post("/billing/webhook");
    expect(res.status).toBe(400);
  });

  it("opens a portal session", async () => {
    const res = await request(app).post("/billing/portal").send({
      returnUrl: "returnUrl",
    });
    expect(res.status).toBe(200);
    expect(res.body.url).toBe("returnUrl");
    expect(User.find).toHaveBeenCalled();
  });

  it("fails to open a portal session if an error is thrown", async () => {
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
    const res = await request(app).post("/billing/portal").send({
      returnUrl: "returnUrl",
    });
    expect(res.status).toBe(500);
  });
});
