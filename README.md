# Asterspark

==================================================
## *** Note: This project is no longer in development
==================================================

## Backend

### Requirements

- Node.js (v20.1.0)
- npm

### Installation

Within the backend directory, run `npm install`.

A .env file is also required in the `backend/` directory. This should contain the following:

```
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
SESSION_SECRET=secret
FRONTEND_URL=http://localhost:3000
PORT=8000
MONGO_URL=mongodb://localhost:27017/your_db_name
STRIPE_SECRET_KEY_TEST=sk_test_abcdefg
STRIPE_WEBHOOK_SECRET_TEST=whsec_abcdefg
OPENAI_API_KEY=abcdefg
```

### Running

Within the backend directory, run `npm start`. The application will be accessible at
`http://localhost:8000/`. This will enable auto-reloading of the server whenever changes are made.
To disable this, instead run `npm run start:prod` (for production environments).

To test out Stripe features in a development environment, use the Stripe CLI to forward webhooks:
`stripe listen --forward-to localhost:8000/billing/webhook`.

### Testing

Within the backend directory, run `npm run unit` to run unit tests.
Run `npm run integration` to run integration tests.

## Database

Currently using a locally hosted MongoDB Community server.
Install using https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/.

Change the net properties in `/etc/mongod.conf` to the following:

```
net:
  port: 27017
  bindIpAll: true
  ipv6: true
```

To connect to a database hosted on Cybera using MongoDB Compass, use the ssh proxy tunnel to first
connect to the Cybera instance, then use localhost:27017 as the MongoDB URI.

## Frontend

### Installation

Within the frontend directory, run `npm install`.

A .env file is also required in the `frontend/` directory. This should contain the following:

```
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID
VITE_API_URL=http://localhost:8000
VITE_STRIPE_PRICE_ID=price_abcdefg
VITE_WAITLIST_GOOGLE_LINK=https://script.google.com/macros/s/abcdefg/exec
VITE_GOOGLE_ANALYTICS_TAG=G-A1B2C3D4E5
```

### Running

Within the frontend directory, run `npm start`. The application will be accessible at
`http://localhost:3000/`.

### Testing

Within the frontend directory, run `npm test` to run unit tests.

Run integration tests using `npx playwright test`. Ensure the backend is not running before running
this command. Integration tests also require a `.env.test` file to be created in the
tests/integration directory. This should contain the following:

```
SKIP_AUTH=true
VITE_API_URL=http://localhost:8000
```

## Deployment

Currently, deployment is done on Google Cloud Platform using Google Cloud Run.

After logging into the Google Cloud Platform console, follow these steps to prepare a project:

- Create a new project.
- Create an OAuth Client ID under the APIs & Services section. An OAuth consent screen will also
  need to be set up. We also require the People API to be enabled.
- Enable the MongoDB Atlas integration:
  - Create a new database and user account.
  - Add relevant IP addresses to the network access list. This will need to be updated later once
    the Cloud Run services are deployed.
  - Update user permissions to Atlas Admin.
- Set up database encryption. Follow the instructions in the README for mongodb_csfle.
- Ensure the following environment variables are set in the .env files:

#### Backend

```
GOOGLE_CLIENT_ID=abcdefg.apps.googleusercontent.com
SESSION_SECRET=secret
# The URL of the frontend once it is deployed.
FRONTEND_URL=https://frontend-abcdefg-uw.a.run.app
PORT=8000
# The URL of the MongoDB Atlas database. Ensure the database name is added to the URL as indicated.
MONGO_URL=mongodb+srv://username:password@abcdefg.mongodb.net/database-name?retryWrites=true&w=majority
STRIPE_SECRET_KEY_TEST=sk_test_abcdefg
STRIPE_WEBHOOK_SECRET_TEST=whsec_abcdefg
OPENAI_API_KEY=abcdefg
MONGODB_CRYPTD_SPAWN_PATH=/usr/bin/mongocryptd
NODE_ENV=production
# CSFLE-related.
GOOGLE_CLIENT_EMAIL=<GCP Service Account Email>
GOOGLE_PRIVATE_KEY=<GCP Service Account Private Key>
```

#### Frontend

```
VITE_GOOGLE_CLIENT_ID=abcdefg.apps.googleusercontent.com
# The URL of the backend once it is deployed.
VITE_API_URL=https://backend-abcdefg-uw.a.run.app
VITE_STRIPE_PRICE_ID=price_abcdefg
VITE_WAITLIST_GOOGLE_LINK=https://script.google.com/macros/s/abcdefg/exec
VITE_GOOGLE_ANALYTICS_TAG=G-ABCDEFG
```

The gcloud CLI is required to proceed: https://cloud.google.com/sdk/docs/install.
From the backend directory, run `gcloud builds submit --tag gcr.io/[project_id]/backend`.
Once it is complete, run `gcloud run deploy --image gcr.io/[project_id]/backend --platform managed`.
From the frontend directory, run `gcloud builds submit --tag gcr.io/[project_id]/frontend`.
Once it is complete, run `gcloud run deploy --image gcr.io/[project_id]/frontend --platform managed`.

Then you can find the respective URLs of the deployed services in the console: https://console.cloud.google.com/run.
These should be updated in the .env files. Also add the frontend URL to the list of authorised
JavaScript origins in the OAuth Client ID settings.

Once the services are running, a custom domain can be mapped to the frontend service.

#### Database

MongoDB Atlas is currently being used for the database. Ensure that traffic is allowed into the
database. This can be done by adding the IP address of the Cloud Run services to the IP access list.

#### Stripe

Ensure that a Webhook endpoint is created in the Stripe dashboard. This should point to
`https://backend-abcdefg-uw.a.run.app/billing/webhook` for the backend service. Replace the URL
with the actual backend URL, keeping the /billing/webhook path at the end.
