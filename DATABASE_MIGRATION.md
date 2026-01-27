# Database Migration Guide - Furama Lab

## Tổng quan

Database hiện tại **CHƯA đủ** để hỗ trợ đầy đủ giao diện mới. Cần thêm các trường sau:

### Các trường cần thêm:
1. **status** - Trạng thái app (ACTIVE, TRIAL, MAINTENANCE)
2. **version** - Phiên bản app (ví dụ: "1.0.0")
3. **category** - Danh mục app (OPERATIONS, MARKETING, HR, FINANCE, TECHNICAL, OTHER)
4. **icon** - Icon/emoji để hiển thị (tùy chọn)

## Cách chạy migration

### Bước 1: Chạy migration script

```bash
# Kết nối vào PostgreSQL
psql -U postgres -d app_hub

# Hoặc nếu đã ở trong psql:
\c app_hub

# Chạy migration
\i alter_table_add_app_fields.sql
```

Hoặc chạy trực tiếp:
```bash
psql -U postgres -d app_hub -f alter_table_add_app_fields.sql
```

### Bước 2: Kiểm tra kết quả

```sql
-- Kiểm tra các cột mới đã được thêm
\d apps

-- Kiểm tra dữ liệu
SELECT id, name, status, version, category, icon FROM apps LIMIT 5;
```

## Mapping dữ liệu

### Status (Trạng thái)
- `ACTIVE` → "Hoạt động" (màu xanh)
- `TRIAL` → "Thử nghiệm" (màu xanh dương)
- `MAINTENANCE` → "Bảo trì" (màu vàng)

### Category (Danh mục)
- `OPERATIONS` → "Vận hành"
- `MARKETING` → "Marketing"
- `HR` → "Nhân sự"
- `FINANCE` → "Tài chính"
- `TECHNICAL` → "Kỹ thuật"
- `OTHER` → "Khác"

### Version
- Format: "1.0.0", "2.1.3", etc.
- Mặc định: "1.0.0"

### Icon
- Có thể là emoji: "📊", "👥", "💰", "📢", "📡", "💻"
- Hoặc để NULL để dùng logic tự động dựa trên category/name

## Cập nhật dữ liệu hiện có (tùy chọn)

Nếu bạn muốn cập nhật các app hiện có với giá trị mặc định:

```sql
-- Cập nhật status mặc định
UPDATE apps SET status = 'ACTIVE' WHERE status IS NULL;

-- Cập nhật version mặc định
UPDATE apps SET version = '1.0.0' WHERE version IS NULL;

-- Cập nhật category dựa trên tên app (ví dụ)
UPDATE apps SET category = 'OPERATIONS' WHERE name ILIKE '%pms%' OR name ILIKE '%core%';
UPDATE apps SET category = 'HR' WHERE name ILIKE '%staff%' OR name ILIKE '%nhân sự%';
UPDATE apps SET category = 'FINANCE' WHERE name ILIKE '%revenue%' OR name ILIKE '%tài chính%';
UPDATE apps SET category = 'MARKETING' WHERE name ILIKE '%marketing%';
UPDATE apps SET category = 'TECHNICAL' WHERE name ILIKE '%network%' OR name ILIKE '%mạng%';
UPDATE apps SET category = 'OTHER' WHERE category IS NULL;
```

## Rollback (nếu cần)

Nếu muốn rollback migration:

```sql
-- Xóa các cột mới
ALTER TABLE apps 
  DROP COLUMN IF EXISTS status,
  DROP COLUMN IF EXISTS version,
  DROP COLUMN IF EXISTS category,
  DROP COLUMN IF EXISTS icon;

-- Xóa các ENUM types
DROP TYPE IF EXISTS app_status;
DROP TYPE IF EXISTS app_category;
```

## Lưu ý

- Migration này **backward compatible** - các app cũ sẽ có giá trị mặc định
- API đã được cập nhật để hỗ trợ các trường mới
- Frontend đã được cập nhật để sử dụng các trường mới với fallback logic
