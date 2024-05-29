/** Utility functions used throughout the app. */
import { BSON } from "bson";
import { type NextFunction, type Request, type Response } from "express";
import mongoose from "mongoose";
import { Configuration, OpenAIApi } from "openai";

const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY_TEST);

// Setup storage location for images.
// Don't run it during unit testing, since it requires a database connection.
// This uses the mongoose connection in the production environment only, since the community
// version of MongoDB (used in development) does not support client-side encryption.
const url =
  process.env.TEST_ENV !== "integration"
    ? process.env.MONGO_URL
    : process.env.MONGO_URL?.concat("testdb");
const connectionMethod =
  process.env.NODE_ENV === "production" ? { db: mongoose.connection } : { url };
export const storage =
  process.env.TEST_ENV !== "unit"
    ? new GridFsStorage({
        ...connectionMethod,
        file: (req: Request, file: Express.Multer.File) => {
          return {
            bucketName: "asterspark-images",
            // Use current timestamp to give unique names to images.
            filename: `${Date.now()}_${file.originalname}`,
          };
        },
      })
    : undefined;

// Middleware for handling image uploads.
export const imageUpload = multer({ storage });

// Middleware that ensures the user is logged in. Ignores the login route.
export const checkAuthHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Don't check for authentication on CORS preflight requests (OPTIONS).
  if (
    req.url !== "/auth/login" &&
    req.url !== "/auth/logout" &&
    req.url !== "/auth/verify" &&
    req.url !== "/auth/user" &&
    req.url !== "/billing/webhook" &&
    req.method !== "OPTIONS"
  ) {
    if (!(req.session?.isPopulated ?? false)) {
      res.status(401).send("Not logged in");
      return;
    }
  }
  next();
};

// Middleware that ensures the user has an active subscription.
export const checkSubscriptionHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Don't check CORS preflight requests (OPTIONS).
  if (
    req.url !== "/auth/login" &&
    req.url !== "/auth/logout" &&
    req.url !== "/auth/verify" &&
    req.url !== "/auth/user" &&
    req.url !== "/billing/checkout" &&
    req.url !== "/billing/webhook" &&
    req.method !== "OPTIONS"
  ) {
    if (req.session?.subscriptionStatus !== "active") {
      res.status(402).send("No active subscription");
    }
  }
  next();
};

// Verify Google OAuth2 ID token.
export async function verify(req: Request): Promise<any> {
  // Based on https://developers.google.com/identity/gsi/web/guides/verify-google-id-token.
  const { OAuth2Client } = require("google-auth-library");
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  client.setCredentials({ access_token: req.body.credential });
  // Get general user info.
  const generalInfo = (
    await client.request({
      url: "https://www.googleapis.com/oauth2/v3/userinfo",
    })
  ).data;
  // Get birthday info.
  const birthdayInfo = (
    await client.request({
      url: "https://people.googleapis.com/v1/people/me?personFields=birthdays",
    })
  ).data;
  let birthdate = null;
  if (
    birthdayInfo.birthdays !== undefined &&
    birthdayInfo.birthdays.length > 0
  ) {
    const birthdateObj: { year: string; month: string; day: string } =
      birthdayInfo.birthdays[0].date;
    birthdate = `${birthdateObj.year}-${birthdateObj.month}-${birthdateObj.day}`;
  }

  return {
    sub: generalInfo.sub,
    firstName: generalInfo.given_name,
    lastName: generalInfo.family_name,
    email: generalInfo.email,
    birthdate,
  };
}

// Create a Stripe checkout session for subscriptions.
export async function createStripeCheckoutSession(
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  userId: string
): Promise<any> {
  return stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    client_reference_id: userId,
  });
}

// Create a Stripe webhook event.
export function createStripeWebhookEvent(
  body: any,
  signature: string | string[] | undefined,
  webhookSecret: string
): any {
  return stripe.webhooks.constructEvent(body, signature, webhookSecret);
}

// Create a Stripe portal session for subscription management.
export async function createStripePortalSession(
  customerId: string,
  returnUrl: string
): Promise<any> {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

// Calculate the size in bytes of a document or list of documents.
export function bsonSize(documents: any): number {
  if (documents === null) {
    return 0;
  }
  if (Array.isArray(documents)) {
    return documents.reduce(
      (total: number, document) => total + bsonSize(document),
      0
    );
  } else {
    return BSON.calculateObjectSize(documents);
  }
}

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Create an OpenAI completion.
export async function createAICompletion(
  messages: any[],
  maxTokens: number,
  model: string = "gpt-3.5-turbo",
  temperature: number = 0.6
): Promise<any> {
  const completion = await openai.createChatCompletion({
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  });

  return completion.data.choices[0].message?.content;
}
