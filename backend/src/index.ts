import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { initFirebase } from './firebase';

dotenv.config();

initFirebase();

const app = express();
const httpServer = http.createServer(app);

const PORT = process.env.PORT || 8000;

interface MyContext {
  token?: string;
}

async function startServer() {
  const server = new ApolloServer<MyContext>({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  app.get('/healthz', (_, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/', (_, res) => {
    res.json({ message: 'Welcome to the API. Visit /graphql for the GraphQL playground.' });
  });

  app.use(
    '/graphql',
    cors({
      origin: ['http://localhost:5173', 'http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({ token: req.headers.token }),
    }),
  );

  await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
}

startServer().catch((err) => {
  console.error('Error starting server:', err);
});
