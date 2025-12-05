# 🔧 Fix lỗi API trên Vercel

## Vấn đề
Frontend báo lỗi "Failed to fetch" vì không tìm thấy API.

## Giải pháp đã áp dụng:

1. **API Routes**: Đã sửa để mount routes với prefix `/api` trong Express
2. **Vercel Config**: Đã cấu hình rewrites để route `/api/*` đến serverless function
3. **API Service**: Đã tự động detect API URL trên production

## Kiểm tra sau khi deploy:

1. **Kiểm tra API Health:**
   ```
   https://your-app.vercel.app/api/health
   ```
   Nên trả về: `{"status":"ok","timestamp":"..."}`

2. **Kiểm tra API Apps:**
   ```
   https://your-app.vercel.app/api/apps
   ```
   Nên trả về array của apps hoặc `[]`

3. **Kiểm tra Browser Console:**
   - Mở DevTools → Network tab
   - Xem request đến `/api/apps` có thành công không
   - Kiểm tra CORS errors

## Nếu vẫn lỗi:

### Option 1: Kiểm tra Environment Variables
Đảm bảo đã set:
- `DATABASE_URL` hoặc các biến `DB_*`
- Database đã được tạo và migration đã chạy

### Option 2: Kiểm tra Function Logs
1. Vào Vercel Dashboard
2. Chọn project → Deployments
3. Click vào deployment mới nhất
4. Xem Function Logs để tìm lỗi

### Option 3: Test API trực tiếp
Mở terminal và test:
```bash
curl https://your-app.vercel.app/api/health
```

Nếu trả về lỗi, xem logs trong Vercel Dashboard.

### Option 4: Kiểm tra Database Connection
Nếu API trả về 500, có thể là lỗi database:
- Kiểm tra connection string đúng chưa
- Kiểm tra database đã được tạo chưa
- Kiểm tra migration đã chạy chưa

## Debug Steps:

1. **Thêm logging vào API:**
   ```javascript
   // Trong api/server.js
   app.use((req, res, next) => {
     console.log('Request:', req.method, req.path);
     next();
   });
   ```

2. **Kiểm tra API_BASE_URL:**
   Thêm vào `services/apiService.ts`:
   ```typescript
   console.log('API_BASE_URL:', API_BASE_URL);
   ```

3. **Xem Network requests:**
   - Mở DevTools → Network
   - Filter: XHR
   - Xem request đến API có gửi đi không
   - Xem response status code

## Common Issues:

### CORS Error
Nếu thấy CORS error, đảm bảo `cors()` middleware đã được thêm vào Express app.

### 404 Not Found
- Kiểm tra `vercel.json` đã đúng chưa
- Kiểm tra file `api/index.js` đã có chưa
- Kiểm tra routes đã được mount đúng chưa

### 500 Internal Server Error
- Xem Function Logs trong Vercel
- Kiểm tra database connection
- Kiểm tra environment variables

