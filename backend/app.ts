import express, {
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response,
} from "express";

import { createUser, getUser } from "./db/auth";
import { connect } from "./db/db";
import { checkAuthHandler, checkSubscriptionHandler } from "./utils";
const createError = require("http-errors");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const logger = require("morgan");

const authRouter = require("./routes/auth");
const workspacesRouter = require("./routes/workspaces");
const blocksRouter = require("./routes/blocks");
const resourcesRouter = require("./routes/resources");
const projectsRouter = require("./routes/projects");
const stickyNotesRouter = require("./routes/stickyNotes");
const billingRouter = require("./routes/billing");
const skillsRouter = require("./routes/skills");
const guntherRouter = require("./routes/gunther");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express();

app.set("trust proxy", 1);

// Connect to the database.
app.use((async (req, res, next) => {
  await connect();
  next();
}) as RequestHandler);

// Session Management.
// Send cookie to frontend (called session) which contains the user ID.
app.use(
  cookieSession({
    name: "session",
    secret: process.env.SESSION_SECRET,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : false,
    // Expires after 1 week.
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
);

app.use(logger("dev"));
app.use((req, res, next): void => {
  // Don't parse JSON for Stripe webhooks.
  if (req.originalUrl === "/billing/webhook") {
    next();
  } else {
    express.json()(req, res, next);
  }
});
app.use((req, res, next) => {
  // Don't parse urlencoded bodies for Stripe webhooks.
  if (req.originalUrl === "/billing/webhook") {
    next();
  } else {
    express.urlencoded({ extended: false })(req, res, next);
  }
});
app.use(cookieParser());

// Handle CORS.
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// Add option to skip Google authentication for internal testing.
if (process.env.SKIP_AUTH !== "true") {
  app.use(checkAuthHandler);
  // Check if the user has an active subscription.
  app.use(checkSubscriptionHandler);
} else {
  // Login as test user for internal testing.
  app.use((async (req, res, next) => {
    const users = await getUser("userId");
    if (users.length === 0) {
      // Create the user if they don't exist.
      await createUser(
        "userId",
        "testing@gmail.com",
        "Test",
        "User",
        "2023-07-10",
        0,
        [],
        15,
        true
      );
    }
    req.session = { userId: "userId" };
    next();
  }) as RequestHandler);
}

// Check if the user still has storage space.
app.use((async (req, res, next) => {
  // Only check if the user is creating or updating documents.
  if (req.method === "POST" || req.method === "PATCH") {
    const users = await getUser(req.session?.userId);
    if (users.length === 1 && users[0].storage >= 100000000) {
      res
        .status(400)
        .send(
          "Storage limit reached. Please delete some of your content before trying again."
        );
      return;
    }
  }
  next();
}) as RequestHandler);

app.use("/auth", authRouter);
app.use("/workspaces", workspacesRouter);
app.use("/blocks", blocksRouter);
app.use("/resources", resourcesRouter);
app.use("/projects", projectsRouter);
app.use("/stickyNotes", stickyNotesRouter);
app.use("/billing", billingRouter);
app.use("/skills", skillsRouter);
app.use("/gunther", guntherRouter);

// Add Swagger documentation.
const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Asterspark API",
      version: "0.1.0",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT ?? 8000}`,
      },
    ],
  },
  apis: ["./routes/*.ts"],
};

const specs = swaggerJsdoc(options);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));

// Catch 404 and forward to error handler.
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler.
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // Set locals, only providing error in development.
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Send the error response.
  res.status(err.status ?? 500).send("Internal server error");
});

module.exports = app;
