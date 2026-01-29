-- ============================================================
-- Tạo bảng categories để quản lý danh mục động
-- Chạy file này để thêm bảng categories và dữ liệu mặc định
-- ============================================================

-- 1. Tạo bảng categories
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);

-- 2. Chèn danh mục mặc định (chỉ khi bảng trống)
INSERT INTO categories (name, slug, sort_order, created_at)
SELECT 'Digital Tools', 'digital-tools', 0, (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
WHERE NOT EXISTS (SELECT 1 FROM categories LIMIT 1);

INSERT INTO categories (name, slug, sort_order, created_at)
SELECT 'Khác', 'other', 1, (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
WHERE (SELECT COUNT(*) FROM categories) = 1;

COMMENT ON TABLE categories IS 'Danh mục ứng dụng (quản lý động)';
COMMENT ON COLUMN categories.slug IS 'Định danh URL, dùng trong apps.category và đường dẫn /category/:slug';
