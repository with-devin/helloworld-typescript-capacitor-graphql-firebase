# helloworld-typescript-capacitor-graphql-firebase

A minimal full-stack application with React, TypeScript, Capacitor, GraphQL, and Firestore. This project demonstrates a common architecture for web and mobile applications with a shared codebase.

## Project Structure

```
hello-world-app/
├── frontend/             # React + TypeScript frontend
│   ├── src/              # Source code
│   │   ├── App.tsx       # Main application component
│   │   ├── firebase.ts   # Firebase configuration
│   │   └── components/   # UI components
│   ├── android/          # Android platform files (Capacitor)
│   ├── ios/              # iOS platform files (Capacitor)
│   ├── capacitor.config.ts # Capacitor configuration
│   └── .env              # Environment variables
├── backend/              # Node.js + TypeScript backend
│   ├── src/              # Source code
│   │   ├── index.ts      # Express + Apollo Server setup
│   │   ├── schema.ts     # GraphQL schema
│   │   ├── resolvers.ts  # GraphQL resolvers
│   │   └── firebase.ts   # Firebase configuration
│   └── .env              # Environment variables
└── README.md             # Project documentation
```

## Setup and Run Instructions (Local Development)

### Firestore Setup

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Firestore database in your project
3. Generate a service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file securely

### Backend Setup

1. Install dependencies:
   ```
   cd backend
   npm install
   ```
2. Set up environment variables in `.env` file:
   ```
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY=your-private-key
   FIREBASE_CLIENT_EMAIL=your-client-email
   PORT=8000
   ```
   Note: For development, you can leave these as placeholders - the app will use a mock Firestore database.

3. Run the backend:
   ```
   cd backend
   npm run dev
   ```
   The backend will be available at http://localhost:8000

### Frontend Setup

1. Install dependencies:
   ```
   cd frontend
   npm install
   ```
2. Set up environment variables in `.env` file:
   ```
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_BACKEND_URL=http://localhost:8000/graphql
   ```

3. Run the frontend:
   ```
   cd frontend
   npm run dev
   ```
   The frontend will be available at http://localhost:5173

## Mobile Setup (Capacitor)

After setting up the frontend:

1. Build the web app:
   ```
   cd frontend
   npm run build
   ```

2. Add platforms (already done in this project):
   ```
   npx cap add android
   npx cap add ios
   ```

3. Sync web code to native platforms after making changes:
   ```
   npx cap sync
   ```

4. Open native IDEs for further development:
   ```
   npx cap open android  # For Android
   npx cap open ios      # For iOS (requires macOS)
   ```

### Mobile App Configuration

The Capacitor configuration is in `capacitor.config.ts`:

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.helloworld',
  appName: 'Hello World App',
  webDir: 'dist'
};

export default config;
```

You can customize this configuration with additional settings:

```typescript
const config: CapacitorConfig = {
  appId: 'com.example.helloworld',
  appName: 'Hello World App',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
    allowNavigation: ['*.example.com']
  },
  plugins: {
    // Plugin configurations
  }
};
```

For more details, see the [Capacitor documentation](https://capacitorjs.com/docs/config).

## Deployment to Google Cloud Run

### Setting up Google Cloud

1. Install the Google Cloud SDK if you haven't already:
   https://cloud.google.com/sdk/docs/install

2. Initialize the SDK and authenticate:
   ```
   gcloud init
   gcloud auth login
   ```

3. Set your project ID:
   ```
   gcloud config set project YOUR_PROJECT_ID
   ```

4. Enable required APIs:
   ```
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable artifactregistry.googleapis.com
   ```

### Backend Deployment

1. Build the TypeScript code:
   ```
   cd backend
   npm run build
   ```

2. Build and deploy to Cloud Run using Dockerfile:
   ```
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/hello-world-backend
   gcloud run deploy hello-world-backend \
     --image gcr.io/YOUR_PROJECT_ID/hello-world-backend \
     --platform managed \
     --allow-unauthenticated \
     --region us-central1 \
     --set-env-vars="FIREBASE_PROJECT_ID=your-project-id,FIREBASE_PRIVATE_KEY=your-private-key,FIREBASE_CLIENT_EMAIL=your-client-email"
   ```

3. Note the URL provided after deployment (you'll need it for the frontend).

### Frontend Deployment

1. Update the `.env` file with the deployed backend URL:
   ```
   VITE_BACKEND_URL=https://hello-world-backend-xxxxx-uc.a.run.app/graphql
   ```

2. Build the frontend:
   ```
   cd frontend
   npm run build
   ```

3. Build and deploy to Cloud Run using Dockerfile:
   ```
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/hello-world-frontend
   gcloud run deploy hello-world-frontend \
     --image gcr.io/YOUR_PROJECT_ID/hello-world-frontend \
     --platform managed \
     --allow-unauthenticated \
     --region us-central1
   ```

4. Access your deployed frontend at the URL provided after deployment.

## Development

- Frontend development: `cd frontend && npm run dev`
- Backend development: `cd backend && npm run dev`
- GraphQL playground: Visit `http://localhost:8000/graphql` when backend is running

### GraphQL Schema and Queries

The backend defines the following GraphQL schema:

```graphql
type Message {
  text: String!
  created_at: String
}

type Query {
  hello: Message!
}
```

You can test the GraphQL endpoint with this query:

```graphql
query {
  hello {
    text
    created_at
  }
}
```

Or using curl:

```bash
curl -X POST http://localhost:8000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ hello { text created_at } }"}'
```

Expected response:
```json
{
  "data": {
    "hello": {
      "text": "Hello World from Firestore!",
      "created_at": "2025-05-05T17:21:19.124Z"
    }
  }
}
```

## Dockerfile Examples

### Backend Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 8000

CMD ["npm", "start"]
```

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 8080
CMD ["node", "server.js"]
```
