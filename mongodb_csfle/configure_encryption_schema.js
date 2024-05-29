const mongodb = require("mongodb");
const { MongoClient, Binary } = mongodb;

require("dotenv").config();

var db = process.env.MONGO_DB_NAME;

// start-kmsproviders
const kmsProviders = {
  gcp: {
    email: process.env.GOOGLE_CLIENT_EMAIL,
    privateKey: process.env.GOOGLE_PRIVATE_KEY,
  },
};
// end-kmsproviders

const connectionString = process.env.MONGO_URI;

// start-key-vault
const keyVaultNamespace = "encryption.__keyVault";
// end-key-vault

const dataKey = process.env.MONGODB_DATA_ENCRYPTION_KEY;

// start-schema
// ADD SCHEMAS HERE.
const blockSchema = {
  bsonType: "object",
  encryptMetadata: {
    keyId: [new Binary(Buffer.from(dataKey, "base64"), 4)],
  },
  properties: {
    type: {
      encrypt: {
        bsonType: "string",
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
      },
    },
  },
};
const workspaceSchema = {
  bsonType: "object",
  encryptMetadata: {
    keyId: [new Binary(Buffer.from(dataKey, "base64"), 4)],
  },
  properties: {
    name: {
      encrypt: {
        bsonType: "string",
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
      },
    },
  },
};
const projectSchema = {
  bsonType: "object",
  encryptMetadata: {
    keyId: [new Binary(Buffer.from(dataKey, "base64"), 4)],
  },
  properties: {
    name: {
      encrypt: {
        bsonType: "string",
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
      },
    },
    imageName: {
      encrypt: {
        bsonType: "string",
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
      },
    },
    description: {
      encrypt: {
        bsonType: "string",
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
      },
    },
  },
};
const resourceSchema = {
  bsonType: "object",
  encryptMetadata: {
    keyId: [new Binary(Buffer.from(dataKey, "base64"), 4)],
  },
  properties: {
    name: {
      encrypt: {
        bsonType: "string",
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
      },
    },
    imageName: {
      encrypt: {
        bsonType: "string",
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
      },
    },
  },
};
const stickyNoteSchema = {
  bsonType: "object",
  encryptMetadata: {
    keyId: [new Binary(Buffer.from(dataKey, "base64"), 4)],
  },
  properties: {
    text: {
      encrypt: {
        bsonType: "string",
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
      },
    },
  },
};
const imageFileSchema = {
  bsonType: "object",
  encryptMetadata: {
    keyId: [new Binary(Buffer.from(dataKey, "base64"), 4)],
  },
  properties: {
    filename: {
      encrypt: {
        bsonType: "string",
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
      },
    },
  },
};
const imageChunkSchema = {
  bsonType: "object",
  encryptMetadata: {
    keyId: [new Binary(Buffer.from(dataKey, "base64"), 4)],
  },
  properties: {
    data: {
      encrypt: {
        bsonType: "binData",
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
      },
    },
  },
};
// end-schema

// SPECIFY THE COLLECTION NAME AND ITS CORRESPONDING SCHEMA HERE.
var colls = [
  ["blocks", blockSchema],
  ["workspaces", workspaceSchema],
  ["projects", projectSchema],
  ["resources", resourceSchema],
  ["stickynotes", stickyNoteSchema],
  ["asterspark-images.files", imageFileSchema],
  ["asterspark-images.chunks", imageChunkSchema],
];

// start-client
const secureClient = new MongoClient(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoEncryption: {
    keyVaultNamespace,
    kmsProviders,
    extraOptions: {
      mongocryptdSpawnPath: process.env.MONGODB_CRYPTD_SPAWN_PATH,
    },
  },
});
// end-client

async function main() {
  try {
    await secureClient.connect();
    for (const [collName, collSchema] of colls) {
      const collinfo = secureClient.db(db).listCollections({ name: collName });
      if ((await collinfo.toArray()).length > 0) {
        // If collection already exists, update the schema with encryption.
        await secureClient.db(db).command({
          collMod: collName,
          validator: {
            $jsonSchema: collSchema,
          },
        });
      } else {
        // If collection does not exist, create it with encryption.
        await secureClient.db(db).createCollection(collName, {
          validator: {
            $jsonSchema: collSchema,
          },
        });
      }
    }
  } catch (writeError) {
    console.error("writeError occurred:", writeError);
  } finally {
    await secureClient.close();
  }
}

main();
