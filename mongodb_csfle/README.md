Utility features for setting up MongoDB's Client-Side Field Level Encryption ([CSFLE](https://www.mongodb.com/docs/manual/core/csfle/)).
This needs to be set up for the production database (Atlas), but not for the development database (Community edition).

## Usage

### make_data_key.js

**Only run this script once for a fresh database. It will drop the entire existing database.**

Install dependencies using `npm install`.
The mongocryptd process must also be installed locally. See [here](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-enterprise-on-ubuntu/).
A Key Management Service (KMS) must also be set up on the Google Cloud Platform. Follow the instructions [here](https://www.mongodb.com/docs/manual/core/csfle/tutorials/gcp/gcp-automatic/#set-up-the-kms). This may require the Compute Engine API and Secret Manager API to be
enabled.

Next, set up the following .env file:

```
MONGO_URI=<URI>
MONGO_DB_NAME=<DN Name>

GOOGLE_CLIENT_EMAIL=<GCP Service Account Email>
GOOGLE_PRIVATE_KEY=<GCP Service Account Private Key>
GOOGLE_PROJECT_ID=<GCP Project ID>
GOOGLE_KMS_LOCATION=<GCP KMS Location>
GOOGLE_KMS_KEY_RING=<Name of GCP KMS Keyring>
GOOGLE_KMS_KEY_NAME=<Name of GCP KMS Key>

MONGODB_CRYPTD_SPAWN_PATH=/usr/bin/mongocryptd
```

Run the script using `node ./make_data_key.js`.
This will output a datakey ID, which should be saved for later use.

### configure_encryption_schema.js

Next the database collections need to be configured to use encryption. This script can be run
multiple times, whenever there is a change to the schema. All collections need to be specified
in the script, indicating which fields are to be encrypted.

Add the following to the .env file:

```
MONGODB_DATA_ENCRYPTION_KEY=<Key generated from make_data_key.js>
```

Then run it using `node ./configure_encryption_schema.js`.
