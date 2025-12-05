# Hướng dẫn Deploy lên Vercel

## Bước 1: Chuẩn bị Database

Bạn có 2 lựa chọn:

### Option 1: Vercel Postgres (Khuyến nghị)
1. Vào [Vercel Dashboard](https://vercel.com/dashboard)
2. Chọn project → Settings → Storage
3. Tạo Vercel Postgres database
4. Copy connection string

### Option 2: External Database (Supabase, Neon, Railway)
- Sử dụng PostgreSQL từ Supabase, Neon, hoặc Railway
- Copy connection string từ provider

## Bước 2: Setup Environment Variables

Trong Vercel Dashboard → Project → Settings → Environment Variables, thêm:

```
# Database
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=app_hub
DB_USER=your-db-user
DB_PASSWORD=your-db-password

# Hoặc nếu dùng connection string (Supabase/Neon):
DATABASE_URL=postgresql://user:password@host:port/database

# Gemini API (nếu có)
GEMINI_API_KEY=your-gemini-api-key

# Frontend API URL (để trống để tự động detect)
VITE_API_URL=
```

## Bước 3: Deploy lên Vercel

### Cách 1: Deploy qua Vercel CLI

```bash
# Cài đặt Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy production
vercel --prod
```

### Cách 2: Deploy qua GitHub

1. Push code lên GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. Vào [Vercel Dashboard](https://vercel.com/new)
3. Import project từ GitHub
4. Vercel sẽ tự động detect settings
5. Thêm Environment Variables
6. Click Deploy

## Bước 4: Chạy Database Migration

Sau khi deploy, bạn cần chạy SQL migration:

### Nếu dùng Vercel Postgres:
1. Vào Vercel Dashboard → Storage → Postgres
2. Mở SQL Editor
3. Chạy file `schema.sql`
4. Chạy file `alter_table_add_image.sql` (nếu cần)

### Nếu dùng external database:
```bash
psql <your-connection-string> -f schema.sql
psql <your-connection-string> -f alter_table_add_image.sql
```

## Bước 5: Cập nhật Database Config (nếu cần)

Nếu database provider của bạn dùng connection string thay vì các biến riêng lẻ, cập nhật `api/config/database.js`:

```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
});
```

## Cấu trúc Routes trên Vercel

- Frontend: `https://your-app.vercel.app/`
- API: `https://your-app.vercel.app/api/apps`
- API: `https://your-app.vercel.app/api/feedback`

## Troubleshooting

### Lỗi kết nối database:
- Kiểm tra Environment Variables đã được set đúng chưa
- Kiểm tra database đã được tạo và migration đã chạy chưa
- Kiểm tra firewall settings của database provider

### API không hoạt động:
- Kiểm tra logs trong Vercel Dashboard → Deployments → Functions
- Đảm bảo `vercel.json` đã được commit

### Frontend không load:
- Kiểm tra build logs trong Vercel
- Đảm bảo `npm run build` chạy thành công

## Notes

- Vercel sẽ tự động build frontend với `npm run build`
- API sẽ chạy như serverless functions
- Database connection sẽ được pool tự động
- Environment variables sẽ được inject vào runtime

