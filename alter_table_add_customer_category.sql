-- Migration: Thêm category CUSTOMER vào enum app_category
-- Chạy file này nếu bạn đã chạy alter_table_add_app_fields.sql trước đó

-- Cách 1: Nếu enum chưa có CUSTOMER, thêm vào
DO $$ 
BEGIN
    -- Kiểm tra xem giá trị CUSTOMER đã tồn tại chưa
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'CUSTOMER' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'app_category')
    ) THEN
        -- Thêm giá trị mới vào enum
        ALTER TYPE app_category ADD VALUE 'CUSTOMER';
    END IF;
END $$;

-- Hoặc cách 2: Nếu bạn muốn tạo lại enum (chỉ dùng khi chưa có dữ liệu)
-- DROP TYPE IF EXISTS app_category CASCADE;
-- CREATE TYPE app_category AS ENUM ('OPERATIONS', 'MARKETING', 'HR', 'FINANCE', 'TECHNICAL', 'CUSTOMER', 'OTHER');
-- ALTER TABLE apps ALTER COLUMN category TYPE app_category USING category::text::app_category;

-- Cập nhật comment
COMMENT ON COLUMN apps.category IS 'Danh mục app: OPERATIONS (Vận hành), MARKETING, HR (Nhân sự), FINANCE (Tài chính), TECHNICAL (Kỹ thuật), CUSTOMER (Khách hàng), OTHER';
