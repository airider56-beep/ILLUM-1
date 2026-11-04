import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import express from 'express';
import { apiRouter } from './server/api';

function expressApiPlugin(): Plugin {
  return {
    name: 'express-api-plugin',
    configureServer(server) {
      const app = express();
      app.use(express.json({ limit: '10mb' }));
      app.use(apiRouter);
      server.middlewares.use('/api', app);
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), expressApiPlugin()],
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});
