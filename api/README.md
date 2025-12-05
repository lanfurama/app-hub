# App Hub API

Backend API cho App Hub sử dụng Express.js và PostgreSQL.

## Cài đặt

1. Cài đặt dependencies (từ root project):
```bash
npm install
```

2. Tạo file `.env` trong thư mục `api` từ `.env.example`:
```bash
cd api
cp .env.example .env
```

3. Cấu hình database trong file `api/.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=app_hub
DB_USER=postgres
DB_PASSWORD=your_password

PORT=3001
NODE_ENV=development
```

4. Đảm bảo PostgreSQL đã chạy và database đã được tạo (chạy `schema.sql` ở root project)

## Chạy API

Từ root project:
```bash
npm run dev:api
```

API sẽ chạy tại: `http://localhost:3001`

## API Endpoints

### Apps

- `GET /api/apps` - Lấy tất cả apps
  - Query params: `search`, `techStack`
- `GET /api/apps/:id` - Lấy app theo ID
- `POST /api/apps` - Tạo app mới
- `PUT /api/apps/:id` - Cập nhật app
- `DELETE /api/apps/:id` - Xóa app

### Feedback

- `GET /api/feedback` - Lấy tất cả feedback
  - Query params: `appId`, `status`, `type`
- `GET /api/feedback/:id` - Lấy feedback theo ID
- `POST /api/feedback` - Tạo feedback mới
- `PUT /api/feedback/:id` - Cập nhật feedback
- `POST /api/feedback/:id/vote` - Vote cho feedback
- `DELETE /api/feedback/:id` - Xóa feedback

### Health Check

- `GET /health` - Kiểm tra trạng thái server

## Ví dụ Request

### Tạo App mới
```json
POST /api/apps
{
  "id": "app-123",
  "name": "My App",
  "description": "Description here",
  "githubUrl": "https://github.com/user/repo",
  "demoUrl": "https://demo.com",
  "techStack": ["React", "TypeScript", "Node.js"],
  "createdAt": 1704067200000,
  "thumbnailUrl": "https://example.com/thumb.jpg"
}
```

### Tạo Feedback mới
```json
POST /api/feedback
{
  "id": "feedback-123",
  "appId": "app-123",
  "type": "FEATURE",
  "title": "Add dark mode",
  "description": "Please add dark mode support",
  "createdAt": 1704067200000,
  "author": "user123"
}
```

