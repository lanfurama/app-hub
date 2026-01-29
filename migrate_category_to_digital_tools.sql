-- Migration: Chỉ dùng danh mục Digital Tools
-- Chạy sau alter_table_add_app_fields.sql (đã có app_category enum)
-- Lưu ý: Giá trị enum mới phải COMMIT trước khi dùng. Chạy bằng: psql -f migrate_category_to_digital_tools.sql

-- 1. Thêm DIGITAL_TOOLS vào enum app_category
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'app_category' AND e.enumlabel = 'DIGITAL_TOOLS'
  ) THEN
    ALTER TYPE app_category ADD VALUE 'DIGITAL_TOOLS';
  END IF;
END $$;

COMMIT;

-- 2. Cập nhật tất cả app sang DIGITAL_TOOLS (chạy trong transaction mới, sau khi enum đã commit)
UPDATE apps SET category = 'DIGITAL_TOOLS' WHERE category IS NOT NULL;

-- 3. Default cho app mới
ALTER TABLE apps ALTER COLUMN category SET DEFAULT 'DIGITAL_TOOLS';

COMMENT ON COLUMN apps.category IS 'Danh mục: DIGITAL_TOOLS, OTHER';
