import { test as base } from "@playwright/test";
import { exec, execSync } from "child_process";
import { MongoMemoryServer } from "mongodb-memory-server";
import os from "os";
import ps from "ps-node";

import api from "api";

export async function startServer(): Promise<void> {
  // Start the backend API server. Assumes running from /frontend directory.
  exec("npm run build && npm start >> server.out", { cwd: "../backend" });
  // Wait for it to properly start up.
  while (true) {
    try {
      // Currently, the / route is not bound to anything, so it will always raise an error.
      await api.get("/");
    } catch (e: any) {
      // When the server starts sending the response object, it indicates that it is running.
      if (e.response !== undefined) {
        break;
      }
      // Otherwise, keep trying.
    }
  }
}

export async function stopServer(): Promise<void> {
  // Stop the backend API server.
  if (os.platform() === "win32") {
    ps.kill("8000");
  } else {
    execSync("kill $(lsof -t -i :8000 -sTCP:LISTEN)");
  }
}

export const test = base.extend<Record<string, unknown>, { server: any }>({
  server: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use: any) => {
      // Start in-memory MongoDB server.
      const mongod = await MongoMemoryServer.create({
        instance: { dbName: "testdb" },
      });
      const uri = mongod.getUri();
      process.env.MONGO_URL = uri.concat("testdb");
      await startServer();

      await use();

      await mongod.stop();
      await stopServer();
    },
    { scope: "worker", auto: true },
  ],
});

export { expect } from "@playwright/test";
