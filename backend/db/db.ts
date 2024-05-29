/**
 * Database connnection to MongoDB, using mongoose.
 */

import mongoose from "mongoose";

// Export a bucket variable that allows for operations on the GridFS bucket.
export let bucket: mongoose.mongo.GridFSBucket;
(() => {
  mongoose.connection.on("connected", () => {
    bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: "asterspark-images",
    });
  });
})();

const keyVaultNamespace = "encryption.__keyVault";
const kmsProviders = {
  gcp: {
    email: process.env.GOOGLE_CLIENT_EMAIL as string,
    privateKey: process.env.GOOGLE_PRIVATE_KEY as string,
  },
};
const extraOptions = {
  mongocryptdSpawnPath: process.env.MONGODB_CRYPTD_SPAWN_PATH,
};

export async function connect(): Promise<void> {
  if (process.env.MONGO_URL == null) {
    throw new Error("MongoDB URL not found");
  }

  // Only connect if the connection does not already exist.
  if (mongoose.connection.readyState === 0) {
    const connectionOptions =
      process.env.NODE_ENV === "production"
        ? {
            autoEncryption: {
              keyVaultNamespace,
              kmsProviders,
              extraOptions,
            },
          }
        : {};
    await mongoose
      .connect(process.env.MONGO_URL, connectionOptions)
      .then(() => {
        console.log("Connected to MongoDB");
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

export async function close(): Promise<void> {
  await mongoose.connection.close();
}
