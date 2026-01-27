-- Migration: Thêm các trường mới cho giao diện Furama Lab
-- Chạy file này để cập nhật database schema

-- 1. Tạo ENUM type cho app status
CREATE TYPE app_status AS ENUM ('ACTIVE', 'TRIAL', 'MAINTENANCE');

-- 2. Tạo ENUM type cho app category
CREATE TYPE app_category AS ENUM ('OPERATIONS', 'MARKETING', 'HR', 'FINANCE', 'TECHNICAL', 'CUSTOMER', 'OTHER');

-- 3. Thêm các cột mới vào bảng apps
ALTER TABLE apps 
  ADD COLUMN IF NOT EXISTS status app_status DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS version VARCHAR(50) DEFAULT '1.0.0',
  ADD COLUMN IF NOT EXISTS category app_category DEFAULT 'OTHER',
  ADD COLUMN IF NOT EXISTS icon VARCHAR(10); -- Emoji hoặc icon identifier

-- 4. Tạo index cho status và category để tối ưu truy vấn
CREATE INDEX IF NOT EXISTS idx_apps_status ON apps(status);
CREATE INDEX IF NOT EXISTS idx_apps_category ON apps(category);

-- 5. Cập nhật dữ liệu mặc định cho các app hiện có (nếu cần)
-- UPDATE apps SET status = 'ACTIVE' WHERE status IS NULL;
-- UPDATE apps SET version = '1.0.0' WHERE version IS NULL;
-- UPDATE apps SET category = 'OTHER' WHERE category IS NULL;

-- 6. Comment giải thích các trường mới
COMMENT ON COLUMN apps.status IS 'Trạng thái app: ACTIVE (Hoạt động), TRIAL (Thử nghiệm), MAINTENANCE (Bảo trì)';
COMMENT ON COLUMN apps.version IS 'Phiên bản app (ví dụ: 1.0.0, 2.1.3)';
COMMENT ON COLUMN apps.category IS 'Danh mục app: OPERATIONS (Vận hành), MARKETING, HR (Nhân sự), FINANCE (Tài chính), TECHNICAL (Kỹ thuật), CUSTOMER (Khách hàng), OTHER';
COMMENT ON COLUMN apps.icon IS 'Icon/emoji để hiển thị cho app (ví dụ: 📊, 👥, 💰)';
