import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import appsRouter from './routes/apps.js';
import feedbackRouter from './routes/feedback.js';
import categoriesRouter from './routes/categories.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

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
app.use('/api/v1/categories', categoriesRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Export app for Vercel serverless
export default app;

// Start server only if not in Vercel environment and not running in Vite dev mode
if (process.env.VERCEL !== '1' && !process.env.VITE) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/v1/health`);
    console.log(`📱 Apps API: http://localhost:${PORT}/api/v1/apps`);
    console.log(`💬 Feedback API: http://localhost:${PORT}/api/v1/feedback`);
  });
}

