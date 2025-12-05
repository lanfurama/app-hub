import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// GET /api/apps - Lấy tất cả apps
router.get('/', async (req, res) => {
  try {
    const { search, techStack } = req.query;
    let query = 'SELECT * FROM apps';
    const params = [];
    const conditions = [];

    if (search) {
      conditions.push(`(name ILIKE $${params.length + 1} OR description ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }

    if (techStack) {
      const techArray = Array.isArray(techStack) ? techStack : [techStack];
      conditions.push(`tech_stack && $${params.length + 1}`);
      params.push(techArray);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    
    // Convert database format to API format
    const apps = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      githubUrl: row.github_url,
      demoUrl: row.demo_url,
      techStack: row.tech_stack || [],
      createdAt: parseInt(row.created_at),
      thumbnailUrl: row.thumbnail_url || row.image_url,
      imageUrl: row.image_url || row.thumbnail_url,
      aiInsights: row.ai_insights
    }));

    res.json(apps);
  } catch (error) {
    console.error('Error fetching apps:', error);
    res.status(500).json({ error: 'Failed to fetch apps' });
  }
});

// GET /api/apps/:id - Lấy app theo ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM apps WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'App not found' });
    }

    const row = result.rows[0];
    const app = {
      id: row.id,
      name: row.name,
      description: row.description,
      githubUrl: row.github_url,
      demoUrl: row.demo_url,
      techStack: row.tech_stack || [],
      createdAt: parseInt(row.created_at),
      thumbnailUrl: row.thumbnail_url || row.image_url,
      imageUrl: row.image_url || row.thumbnail_url,
      aiInsights: row.ai_insights
    };

    res.json(app);
  } catch (error) {
    console.error('Error fetching app:', error);
    res.status(500).json({ error: 'Failed to fetch app' });
  }
});

// POST /api/apps - Tạo app mới
router.post('/', async (req, res) => {
  try {
    const {
      id,
      name,
      description,
      githubUrl,
      demoUrl,
      techStack,
      createdAt,
      thumbnailUrl,
      imageUrl,
      aiInsights
    } = req.body;

    if (!id || !name || !description || !techStack || !createdAt) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const imageUrlValue = imageUrl || thumbnailUrl || null;
    const result = await pool.query(
      `INSERT INTO apps (id, name, description, github_url, demo_url, tech_stack, created_at, thumbnail_url, image_url, ai_insights)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [id, name, description, githubUrl || null, demoUrl || null, techStack, createdAt, imageUrlValue, imageUrlValue, aiInsights || null]
    );

      const row = result.rows[0];
    const app = {
      id: row.id,
      name: row.name,
      description: row.description,
      githubUrl: row.github_url,
      demoUrl: row.demo_url,
      techStack: row.tech_stack || [],
      createdAt: parseInt(row.created_at),
      thumbnailUrl: row.thumbnail_url || row.image_url,
      imageUrl: row.image_url || row.thumbnail_url,
      aiInsights: row.ai_insights
    };

    res.status(201).json(app);
  } catch (error) {
    console.error('Error creating app:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'App with this ID already exists' });
    }
    res.status(500).json({ error: 'Failed to create app' });
  }
});

// PUT /api/apps/:id - Cập nhật app
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      githubUrl,
      demoUrl,
      techStack,
      thumbnailUrl,
      imageUrl,
      aiInsights
    } = req.body;

    const imageUrlValue = imageUrl !== undefined ? imageUrl : thumbnailUrl;
    const thumbnailValue = thumbnailUrl !== undefined ? thumbnailUrl : imageUrl;

    const result = await pool.query(
      `UPDATE apps 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           github_url = COALESCE($3, github_url),
           demo_url = COALESCE($4, demo_url),
           tech_stack = COALESCE($5, tech_stack),
           thumbnail_url = COALESCE($6, thumbnail_url),
           image_url = COALESCE($7, image_url),
           ai_insights = COALESCE($8, ai_insights)
       WHERE id = $9
       RETURNING *`,
      [name, description, githubUrl, demoUrl, techStack, thumbnailValue, imageUrlValue, aiInsights, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'App not found' });
    }

    const row = result.rows[0];
    const app = {
      id: row.id,
      name: row.name,
      description: row.description,
      githubUrl: row.github_url,
      demoUrl: row.demo_url,
      techStack: row.tech_stack || [],
      createdAt: parseInt(row.created_at),
      thumbnailUrl: row.thumbnail_url || row.image_url,
      imageUrl: row.image_url || row.thumbnail_url,
      aiInsights: row.ai_insights
    };

    res.json(app);
  } catch (error) {
    console.error('Error updating app:', error);
    res.status(500).json({ error: 'Failed to update app' });
  }
});

// DELETE /api/apps/:id - Xóa app
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM apps WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'App not found' });
    }

    res.json({ message: 'App deleted successfully', id });
  } catch (error) {
    console.error('Error deleting app:', error);
    res.status(500).json({ error: 'Failed to delete app' });
  }
});

export default router;

