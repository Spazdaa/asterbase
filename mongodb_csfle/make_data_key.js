const mongodb = require("mongodb");
const { ClientEncryption } = require("mongodb-client-encryption");
const { MongoClient } = mongodb;

require("dotenv").config();

// start-kmsproviders
const provider = "gcp";
const kmsProviders = {
  gcp: {
    email: process.env.GOOGLE_CLIENT_EMAIL,
    privateKey: process.env.GOOGLE_PRIVATE_KEY,
  },
};
// end-kmsproviders

// start-datakeyopts
const masterKey = {
  projectId: process.env.GOOGLE_PROJECT_ID,
  location: process.env.GOOGLE_KMS_LOCATION,
  keyRing: process.env.GOOGLE_KMS_KEY_RING,
  keyName: process.env.GOOGLE_KMS_KEY_NAME,
};
// end-datakeyopts

async function main() {
  // start-create-index
  const uri = process.env.MONGO_URI;
  if (uri == null) {
    throw new Error("MongoDB URI not found");
  }
  const keyVaultDatabase = "encryption";
  const keyVaultCollection = "__keyVault";
  const keyVaultNamespace = `${keyVaultDatabase}.${keyVaultCollection}`;
  const keyVaultClient = new MongoClient(uri);
  await keyVaultClient.connect();
  const keyVaultDB = keyVaultClient.db(keyVaultDatabase);
  // Drop the Key Vault Collection in case you created this collection
  // in a previous run of this application.
  await keyVaultDB.dropDatabase();
  // Drop the database storing your encrypted fields as all
  // the DEKs encrypting those fields were deleted in the preceding line.
  await keyVaultClient.db(process.env.MONGO_DB_NAME).dropDatabase();
  const keyVaultColl = keyVaultDB.collection(keyVaultCollection);
  await keyVaultColl.createIndex(
    { keyAltNames: 1 },
    {
      unique: true,
      partialFilterExpression: { keyAltNames: { $exists: true } },
    }
  );
  // end-create-index

  // start-create-dek
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await client.connect();
  const encryption = new ClientEncryption(client, {
    keyVaultNamespace,
    kmsProviders,
  });
  const key = await encryption.createDataKey(provider, {
    masterKey,
  });
  console.log("DataKeyId [base64]: ", key.toString("base64"));
  await keyVaultClient.close();
  await client.close();
  // end-create-dek
}

main();
