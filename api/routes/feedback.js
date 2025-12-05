import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// GET /api/feedback - Lấy tất cả feedback (có thể filter theo appId, status, type)
router.get('/', async (req, res) => {
  try {
    const { appId, status, type } = req.query;
    let query = 'SELECT * FROM feedback';
    const params = [];
    const conditions = [];

    if (appId) {
      conditions.push(`app_id = $${params.length + 1}`);
      params.push(appId);
    }

    if (status) {
      conditions.push(`status = $${params.length + 1}`);
      params.push(status);
    }

    if (type) {
      conditions.push(`type = $${params.length + 1}`);
      params.push(type);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    
    // Convert database format to API format
    const feedbacks = result.rows.map(row => ({
      id: row.id,
      appId: row.app_id,
      type: row.type,
      title: row.title,
      description: row.description,
      createdAt: parseInt(row.created_at),
      votes: row.votes,
      status: row.status,
      author: row.author
    }));

    res.json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// GET /api/feedback/:id - Lấy feedback theo ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM feedback WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    const row = result.rows[0];
    const feedback = {
      id: row.id,
      appId: row.app_id,
      type: row.type,
      title: row.title,
      description: row.description,
      createdAt: parseInt(row.created_at),
      votes: row.votes,
      status: row.status,
      author: row.author
    };

    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// POST /api/feedback - Tạo feedback mới
router.post('/', async (req, res) => {
  try {
    const {
      id,
      appId,
      type,
      title,
      description,
      createdAt,
      votes,
      status,
      author
    } = req.body;

    if (!id || !appId || !type || !title || !description || !createdAt || !author) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate type và status
    const validTypes = ['BUG', 'FEATURE', 'IMPROVEMENT', 'OTHER'];
    const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];
    
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid feedback type' });
    }

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid feedback status' });
    }

    // Check if app exists
    const appCheck = await pool.query('SELECT id FROM apps WHERE id = $1', [appId]);
    if (appCheck.rows.length === 0) {
      return res.status(404).json({ error: 'App not found' });
    }

    const result = await pool.query(
      `INSERT INTO feedback (id, app_id, type, title, description, created_at, votes, status, author)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [id, appId, type, title, description, createdAt, votes || 0, status || 'OPEN', author]
    );

    const row = result.rows[0];
    const feedback = {
      id: row.id,
      appId: row.app_id,
      type: row.type,
      title: row.title,
      description: row.description,
      createdAt: parseInt(row.created_at),
      votes: row.votes,
      status: row.status,
      author: row.author
    };

    res.status(201).json(feedback);
  } catch (error) {
    console.error('Error creating feedback:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'Feedback with this ID already exists' });
    }
    res.status(500).json({ error: 'Failed to create feedback' });
  }
});

// PUT /api/feedback/:id - Cập nhật feedback
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      type,
      title,
      description,
      votes,
      status
    } = req.body;

    // Validate status nếu có
    if (status) {
      const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid feedback status' });
      }
    }

    const result = await pool.query(
      `UPDATE feedback 
       SET type = COALESCE($1, type),
           title = COALESCE($2, title),
           description = COALESCE($3, description),
           votes = COALESCE($4, votes),
           status = COALESCE($5, status)
       WHERE id = $6
       RETURNING *`,
      [type, title, description, votes, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    const row = result.rows[0];
    const feedback = {
      id: row.id,
      appId: row.app_id,
      type: row.type,
      title: row.title,
      description: row.description,
      createdAt: parseInt(row.created_at),
      votes: row.votes,
      status: row.status,
      author: row.author
    };

    res.json(feedback);
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ error: 'Failed to update feedback' });
  }
});

// POST /api/feedback/:id/vote - Vote cho feedback
router.post('/:id/vote', async (req, res) => {
  try {
    const { id } = req.params;
    const { increment = 1 } = req.body;

    const result = await pool.query(
      `UPDATE feedback 
       SET votes = votes + $1
       WHERE id = $2
       RETURNING *`,
      [increment, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    const row = result.rows[0];
    const feedback = {
      id: row.id,
      appId: row.app_id,
      type: row.type,
      title: row.title,
      description: row.description,
      createdAt: parseInt(row.created_at),
      votes: row.votes,
      status: row.status,
      author: row.author
    };

    res.json(feedback);
  } catch (error) {
    console.error('Error voting feedback:', error);
    res.status(500).json({ error: 'Failed to vote feedback' });
  }
});

// DELETE /api/feedback/:id - Xóa feedback
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM feedback WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.json({ message: 'Feedback deleted successfully', id });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
});

export default router;

