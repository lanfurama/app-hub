-- ============================================================
-- Chuyển apps.category từ enum sang VARCHAR(slug)
-- Chạy SAU create_categories_table.sql
-- Nếu apps.category đã là VARCHAR thì chỉ cần chạy phần UPDATE
-- ============================================================

-- Nếu cột category đang là enum (app_category), chuyển sang VARCHAR
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'apps' AND column_name = 'category' 
    AND data_type = 'USER-DEFINED'
  ) THEN
    ALTER TABLE apps 
    ALTER COLUMN category TYPE VARCHAR(100) 
    USING (
      CASE category::text 
        WHEN 'DIGITAL_TOOLS' THEN 'digital-tools' 
        WHEN 'OTHER' THEN 'other' 
        ELSE lower(replace(category::text, '_', '-')) 
      END
    );
    ALTER TABLE apps ALTER COLUMN category SET DEFAULT 'digital-tools';
  END IF;
END $$;

-- Chuẩn hóa giá trị nếu cột đã là VARCHAR
UPDATE apps SET category = 'digital-tools' 
WHERE category IN ('DIGITAL_TOOLS', 'DIGITAL TOOLS');
UPDATE apps SET category = 'other' 
WHERE category IN ('OTHER', 'Other');
