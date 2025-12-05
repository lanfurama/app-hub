# 🚀 Hướng dẫn Deploy nhanh lên Vercel

## Bước 1: Chuẩn bị Database

### Option A: Vercel Postgres (Dễ nhất)
1. Vào https://vercel.com/dashboard
2. Tạo project mới → Settings → Storage → Create Database → Postgres
3. Copy connection string hoặc các biến môi trường

### Option B: Supabase (Free)
1. Vào https://supabase.com → Tạo project
2. Settings → Database → Copy connection string
3. Format: `postgresql://postgres:[password]@[host]:5432/postgres`

## Bước 2: Push code lên GitHub

```bash
git init
git add .
git commit -m "Ready for deployment"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

## Bước 3: Deploy trên Vercel

1. Vào https://vercel.com/new
2. Import project từ GitHub
3. Vercel sẽ tự động detect:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

## Bước 4: Thêm Environment Variables

Trong Vercel Dashboard → Project → Settings → Environment Variables:

### Nếu dùng Supabase/Neon (Connection String):
```
DATABASE_URL=postgresql://user:password@host:port/database
GEMINI_API_KEY=your-key (optional)
```

### Nếu dùng Vercel Postgres (Individual vars):
```
DB_HOST=xxx.vercel-storage.com
DB_PORT=5432
DB_NAME=verceldb
DB_USER=default
DB_PASSWORD=your-password
GEMINI_API_KEY=your-key (optional)
```

## Bước 5: Chạy Database Migration

### Với Supabase:
1. Vào SQL Editor trong Supabase Dashboard
2. Copy nội dung file `schema.sql` và chạy
3. Copy nội dung file `alter_table_add_image.sql` và chạy

### Với Vercel Postgres:
1. Vào Vercel Dashboard → Storage → Postgres → SQL Editor
2. Chạy `schema.sql`
3. Chạy `alter_table_add_image.sql`

### Với Neon/Railway:
```bash
psql <connection-string> -f schema.sql
psql <connection-string> -f alter_table_add_image.sql
```

## Bước 6: Deploy!

1. Click "Deploy" trong Vercel
2. Đợi build hoàn thành (2-3 phút)
3. Truy cập URL được cung cấp: `https://your-app.vercel.app`

## ✅ Kiểm tra

- Frontend: `https://your-app.vercel.app`
- API Health: `https://your-app.vercel.app/api/health`
- API Apps: `https://your-app.vercel.app/api/apps`

## 🔧 Troubleshooting

**Lỗi kết nối database:**
- Kiểm tra Environment Variables đã set đúng chưa
- Kiểm tra database đã được tạo và migration đã chạy
- Xem logs trong Vercel Dashboard → Deployments → Functions

**API không hoạt động:**
- Kiểm tra file `api/index.js` đã có
- Kiểm tra `vercel.json` đã đúng
- Xem Function logs trong Vercel Dashboard

**Frontend không load:**
- Kiểm tra build logs
- Đảm bảo `npm run build` chạy thành công
- Kiểm tra `dist` folder đã được tạo

## 📝 Notes

- Vercel sẽ tự động detect Express API trong thư mục `api/`
- API sẽ chạy như serverless functions
- Database connection sẽ được pool tự động
- Frontend sẽ tự động detect API URL trên cùng domain

