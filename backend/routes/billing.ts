/**
 * Endpoints related to billing and payments.
 */

import express, { type RequestHandler } from "express";
import moment from "moment";

import { getUser, updateUserPayment } from "../db/auth";
import {
  createStripeCheckoutSession,
  createStripePortalSession,
  createStripeWebhookEvent,
} from "../utils";

const createError = require("http-errors");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: billing
 *     description: Billing endpoints
 *
 * components:
 *   schemas:
 *     CheckoutRequest:
 *       type: object
 *       properties:
 *         priceId:
 *           type: string
 *           description: ID of the Stripe price object being purchased
 *           example: price_abcdefg
 *         successUrl:
 *           type: string
 *           description: The page to redirect to after a successful purchase
 *           example: http://localhost:3000/workspaces/1
 *         cancelUrl:
 *           type: string
 *           description: The page to redirect to after a cancelled purchase
 *           example: http://localhost:3000
 *       xml:
 *         name: checkoutrequest
 *     CheckoutResponse:
 *       type: object
 *       properties:
 *         url:
 *           type: string
 *           description: URL to redirect to after the checkout session is closed
 *           example: http://localhost:3000
 *       xml:
 *         name: checkoutresponse
 *     PortalRequest:
 *       type: object
 *       properties:
 *         returnUrl:
 *           type: string
 *           description: The page to redirect to after the portal session is closed
 *           example: http://localhost:3000/settings
 *       xml:
 *         name: portalrequest
 *     PortalResponse:
 *       type: object
 *       properties:
 *         url:
 *           type: string
 *           description: URL to redirect to after the portal session is closed
 *           example: http://localhost:3000/settings
 *       xml:
 *         name: portalresponse
 */

/**
 * @swagger
 * /billing/checkout:
 *   post:
 *     tags:
 *       - billing
 *     summary: Create a Stripe checkout session
 *     operationId: checkout
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckoutRequest'
 *       required: true
 *     responses:
 *       '200':
 *         description: Successfully created checkout session
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CheckoutResponse'
 *       '500':
 *         description: Internal server error
 */
router.post("/checkout", (async (req, res, next) => {
  try {
    const { priceId, successUrl, cancelUrl } = req.body;
    const session = await createStripeCheckoutSession(
      priceId,
      successUrl,
      cancelUrl,
      req.session?.userId
    );

    res.status(200).send({
      url: session.url,
    });
  } catch (err) {
    next(createError(500, err));
  }
}) as RequestHandler);

/**
 * @swagger
 * /billing/webhook:
 *   post:
 *     tags:
 *       - billing
 *     summary: Process updates from Stripe webhooks
 *     description: Updates the user's subscription information in the database
 *     operationId: webhook
 *     responses:
 *       '204':
 *         description: Successfully processed webhook
 *       '400':
 *         description: Unable to verify signature
 *       '500':
 *         description: Internal server error
 */
router.post("/webhook", express.raw({ type: "application/json" }), (async (
  req,
  res,
  next
) => {
  try {
    let data;
    let eventType;
    // Check if webhook signing is configured.
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_TEST;
    if (webhookSecret != null) {
      // Retrieve the event by verifying the signature using the raw body and secret.
      let event;
      const signature = req.headers["stripe-signature"];

      try {
        event = createStripeWebhookEvent(req.body, signature, webhookSecret);
      } catch (err) {
        next(createError(400, err));
      }
      // Extract the object from the event.
      data = event.data;
      eventType = event.type;
    } else {
      // Webhook signing is recommended, but if the secret is not configured,
      // retrieve the event data directly from the request body.
      data = req.body.data;
      eventType = req.body.type;
    }

    // Add a little bit of leeway for payments to go through.
    // Multiply by 1000 to convert seconds to milliseconds.
    const expiry = moment(data.object.created * 1000)
      .add(1, "month")
      .add(2, "day")
      .toDate();

    switch (eventType) {
      case "checkout.session.completed":
      case "invoice.paid":
        // Payment is successful and the subscription is created or extended.
        // Provision the subscription and save the customer ID to the database.
        await updateUserPayment(
          data.object.client_reference_id,
          data.object.customer,
          data.object.subscription,
          expiry
        );
        break;
      case "invoice.payment_failed":
        // The payment failed or the customer does not have a valid payment method.
        await updateUserPayment(
          data.object.client_reference_id,
          data.object.customer,
          data.object.subscription,
          undefined,
          0,
          false
        );
        break;
      default:
      // Unhandled event type.
    }

    res.status(204).end();
  } catch (err) {
    next(createError(500, err));
  }
}) as RequestHandler);

/**
 * @swagger
 * /billing/portal:
 *   post:
 *     tags:
 *       - billing
 *     summary: Open a Stripe billing portal session
 *     description: Allows users to manage their subscription
 *     operationId: portal
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PortalRequest'
 *       required: true
 *     responses:
 *       '200':
 *         description: Successfully created portal session
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PortalResponse'
 *       '500':
 *         description: Internal server error
 */
router.post("/portal", (async (req, res, next) => {
  try {
    const { returnUrl } = req.body;
    const user = (await getUser(req.session?.userId))[0];
    const portalSession = await createStripePortalSession(
      user.customerId,
      returnUrl
    );

    res.status(200).send({
      url: portalSession.url,
    });
  } catch (err) {
    next(createError(500, err));
  }
}) as RequestHandler);

module.exports = router;
