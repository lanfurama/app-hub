// Vite plugin to integrate Express API server
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import appsRouter from './api/routes/apps.js';
import feedbackRouter from './api/routes/feedback.js';

dotenv.config();

export function apiPlugin() {
  return {
    name: 'api-plugin',
    configureServer(server) {
      const app = express();
      
      // Middleware
      app.use(cors());
      app.use(express.json());
      app.use(express.urlencoded({ extended: true }));

      // Health check endpoint
      app.get('/api/v1/health', (req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
      });

      // API Routes với prefix /api/v1
      app.use('/api/v1/apps', appsRouter);
      app.use('/api/v1/feedback', feedbackRouter);

      // 404 handler
      app.use('/api/v1/*', (req, res) => {
        res.status(404).json({ error: 'Route not found' });
      });

      // Error handler
      app.use((err, req, res, next) => {
        console.error('API Error:', err);
        res.status(500).json({ error: 'Internal server error' });
      });

      // Mount Express app as middleware
      server.middlewares.use(app);
      
      console.log('✅ API server integrated on port 3000');
      console.log('📊 Health check: http://localhost:3000/api/v1/health');
      console.log('📱 Apps API: http://localhost:3000/api/v1/apps');
      console.log('💬 Feedback API: http://localhost:3000/api/v1/feedback');
    }
  };
}

