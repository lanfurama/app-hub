-- Thêm cột image_url vào bảng apps (nếu chưa có)
-- Nếu đã có thumbnail_url, có thể dùng lại hoặc thêm image_url mới

-- Option 1: Nếu muốn thêm cột image_url riêng (để phân biệt thumbnail và image chính)
ALTER TABLE apps ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

-- Option 2: Hoặc nếu muốn đổi tên thumbnail_url thành image_url
-- ALTER TABLE apps RENAME COLUMN thumbnail_url TO image_url;

-- Tạo index cho image_url nếu cần
CREATE INDEX IF NOT EXISTS idx_apps_image_url ON apps(image_url) WHERE image_url IS NOT NULL;

