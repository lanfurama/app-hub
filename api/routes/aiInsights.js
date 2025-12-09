import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// GET /api/v1/ai-insights - Lấy tất cả AI insights
router.get('/', async (req, res) => {
  try {
    const { appId } = req.query;
    let query = 'SELECT * FROM ai_insights';
    const params = [];

    if (appId) {
      query += ' WHERE app_id = $1';
      params.push(appId);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    
    const insights = result.rows.map(row => ({
      id: row.id,
      appId: row.app_id,
      summary: row.summary,
      suggestions: row.suggestions || [],
      technicalChallenges: row.technical_challenges || [],
      createdAt: parseInt(row.created_at),
      updatedAt: parseInt(row.updated_at)
    }));

    res.json(insights);
  } catch (error) {
    console.error('Error fetching AI insights:', error);
    res.status(500).json({ error: 'Failed to fetch AI insights' });
  }
});

// GET /api/v1/ai-insights/:id - Lấy AI insight theo ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM ai_insights WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'AI insight not found' });
    }

    const row = result.rows[0];
    const insight = {
      id: row.id,
      appId: row.app_id,
      summary: row.summary,
      suggestions: row.suggestions || [],
      technicalChallenges: row.technical_challenges || [],
      createdAt: parseInt(row.created_at),
      updatedAt: parseInt(row.updated_at)
    };

    res.json(insight);
  } catch (error) {
    console.error('Error fetching AI insight:', error);
    res.status(500).json({ error: 'Failed to fetch AI insight' });
  }
});

// POST /api/v1/ai-insights - Tạo AI insight mới
router.post('/', async (req, res) => {
  try {
    const { id, appId, summary, suggestions, technicalChallenges } = req.body;

    if (!id || !appId || !summary) {
      return res.status(400).json({ error: 'Missing required fields: id, appId, and summary' });
    }

    // Check if app exists
    const appCheck = await pool.query('SELECT id FROM apps WHERE id = $1', [appId]);
    if (appCheck.rows.length === 0) {
      return res.status(404).json({ error: 'App not found' });
    }

    const now = Math.floor(Date.now() / 1000);
    const result = await pool.query(
      `INSERT INTO ai_insights (id, app_id, summary, suggestions, technical_challenges, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        id,
        appId,
        summary,
        suggestions || [],
        technicalChallenges || [],
        now,
        now
      ]
    );

    const row = result.rows[0];
    const newInsight = {
      id: row.id,
      appId: row.app_id,
      summary: row.summary,
      suggestions: row.suggestions || [],
      technicalChallenges: row.technical_challenges || [],
      createdAt: parseInt(row.created_at),
      updatedAt: parseInt(row.updated_at)
    };

    res.status(201).json(newInsight);
  } catch (error) {
    console.error('Error creating AI insight:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'AI insight with this ID already exists' });
    }
    res.status(500).json({ error: 'Failed to create AI insight' });
  }
});

// DELETE /api/v1/ai-insights/:id - Xóa AI insight
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM ai_insights WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'AI insight not found' });
    }

    res.json({ message: 'AI insight deleted successfully', id });
  } catch (error) {
    console.error('Error deleting AI insight:', error);
    res.status(500).json({ error: 'Failed to delete AI insight' });
  }
});

export default router;

