import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Helper: slug từ name (lowercase, dấu cách -> gạch ngang)
function slugFromName(name) {
  if (!name || typeof name !== 'string') return '';
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// GET /api/v1/categories - Lấy tất cả danh mục (theo sort_order)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, slug, sort_order, created_at FROM categories ORDER BY sort_order ASC, id ASC'
    );
    const categories = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      sortOrder: row.sort_order,
      createdAt: parseInt(row.created_at, 10) || 0,
    }));
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/v1/categories - Tạo danh mục mới
router.post('/', async (req, res) => {
  try {
    let { name, slug, sort_order: sortOrder } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Tên danh mục là bắt buộc' });
    }
    name = name.trim();
    if (!slug || typeof slug !== 'string' || !slug.trim()) {
      slug = slugFromName(name) || 'category-' + Date.now();
    } else {
      slug = slug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    if (!slug) {
      return res.status(400).json({ error: 'Slug không hợp lệ' });
    }
    const sortVal = sortOrder != null ? parseInt(sortOrder, 10) : 999;
    const createdAt = Date.now();

    const result = await pool.query(
      `INSERT INTO categories (name, slug, sort_order, created_at)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, slug, sort_order, created_at`,
      [name, slug, isNaN(sortVal) ? 999 : sortVal, createdAt]
    );
    const row = result.rows[0];
    res.status(201).json({
      id: row.id,
      name: row.name,
      slug: row.slug,
      sortOrder: row.sort_order,
      createdAt: parseInt(row.created_at, 10) || 0,
    });
  } catch (error) {
    console.error('Error creating category:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Slug danh mục đã tồn tại' });
    }
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// PUT /api/v1/categories/:id - Cập nhật danh mục
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID không hợp lệ' });
    }
    let { name, slug, sort_order: sortOrder } = req.body;

    const current = await pool.query(
      'SELECT id, name, slug, sort_order FROM categories WHERE id = $1',
      [id]
    );
    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'Danh mục không tồn tại' });
    }

    const updates = [];
    const params = [];
    let p = 1;

    if (name !== undefined && typeof name === 'string' && name.trim()) {
      updates.push(`name = $${p++}`);
      params.push(name.trim());
    }
    if (slug !== undefined && typeof slug === 'string' && slug.trim()) {
      const cleanSlug = slug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      if (cleanSlug) {
        updates.push(`slug = $${p++}`);
        params.push(cleanSlug);
      }
    }
    if (sortOrder !== undefined) {
      const sortVal = parseInt(sortOrder, 10);
      if (!isNaN(sortVal)) {
        updates.push(`sort_order = $${p++}`);
        params.push(sortVal);
      }
    }

    if (updates.length === 0) {
      const row = current.rows[0];
      return res.json({
        id: row.id,
        name: row.name,
        slug: row.slug,
        sortOrder: row.sort_order,
        createdAt: 0,
      });
    }

    params.push(id);
    const query = `UPDATE categories SET ${updates.join(', ')} WHERE id = $${p} RETURNING id, name, slug, sort_order, created_at`;
    const result = await pool.query(query, params);
    const row = result.rows[0];
    res.json({
      id: row.id,
      name: row.name,
      slug: row.slug,
      sortOrder: row.sort_order,
      createdAt: parseInt(row.created_at, 10) || 0,
    });
  } catch (error) {
    console.error('Error updating category:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Slug danh mục đã tồn tại' });
    }
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE /api/v1/categories/:id - Xóa danh mục (chỉ khi không có app nào dùng)
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID không hợp lệ' });
    }

    const cat = await pool.query('SELECT id, slug FROM categories WHERE id = $1', [id]);
    if (cat.rows.length === 0) {
      return res.status(404).json({ error: 'Danh mục không tồn tại' });
    }
    const slug = cat.rows[0].slug;

    // So sánh theo text để hỗ trợ cả cột enum (OTHER, DIGITAL_TOOLS) và varchar (other, digital-tools)
    const count = await pool.query(
      `SELECT COUNT(*) AS cnt FROM apps WHERE LOWER(TRIM(category::text)) = LOWER(TRIM($1))`,
      [slug]
    );
    const appCount = parseInt(count.rows[0].cnt, 10) || 0;
    if (appCount > 0) {
      return res.status(400).json({
        error: `Không thể xóa: còn ${appCount} ứng dụng thuộc danh mục này. Hãy đổi danh mục cho các ứng dụng trước.`,
      });
    }

    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    res.json({ message: 'Đã xóa danh mục', id });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
