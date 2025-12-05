import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import appsRouter from './routes/apps.js';
import feedbackRouter from './routes/feedback.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
// Mount routes with /api prefix since Vercel rewrites preserve the full path
app.use('/api/apps', appsRouter);
app.use('/api/feedback', feedbackRouter);

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

// Start server only if not in Vercel environment
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📱 Apps API: http://localhost:${PORT}/api/apps`);
    console.log(`💬 Feedback API: http://localhost:${PORT}/api/feedback`);
  });
}

