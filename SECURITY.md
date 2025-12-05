# 🔒 Security Best Practices

## Database Security

### 1. Environment Variables

**✅ DO:**
- Luôn sử dụng file `.env` để lưu credentials
- Thêm `.env` vào `.gitignore` (đã được thêm)
- Sử dụng `.env.example` làm template
- Sử dụng strong passwords cho database
- Rotate passwords định kỳ

**❌ DON'T:**
- KHÔNG commit file `.env` vào git
- KHÔNG hardcode credentials trong code
- KHÔNG share `.env` file qua email/messaging
- KHÔNG commit credentials trong comments

### 2. Database Connection Security

#### Local Development
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=app_hub
DB_USER=postgres
DB_PASSWORD=strong_password_here
DB_SSL=false
```

#### Production (Vercel/Supabase)
- Sử dụng Environment Variables trong Vercel Dashboard
- Không expose credentials trong client-side code
- Sử dụng connection pooling
- Enable SSL cho production databases

### 3. Vercel Deployment Security

#### Setup Environment Variables trong Vercel:

1. Vào Vercel Dashboard → Project → Settings → Environment Variables
2. Thêm các biến:
   ```
   DATABASE_URL=postgresql://...
   DB_SSL=true
   GEMINI_API_KEY=...
   ```
3. Chọn environment: Production, Preview, Development
4. Click "Save"

**Lưu ý:**
- Environment Variables trong Vercel được encrypt
- Chỉ accessible trong serverless functions
- Không expose ra client-side

### 4. Database Access Control

#### Best Practices:
- Tạo user riêng cho ứng dụng (không dùng superuser)
- Chỉ grant permissions cần thiết
- Sử dụng read-only user cho queries nếu có thể
- Enable firewall rules trên database server
- Whitelist IP addresses nếu có thể

#### PostgreSQL Example:
```sql
-- Tạo user riêng cho app
CREATE USER app_user WITH PASSWORD 'strong_password';

-- Grant permissions chỉ cho tables cần thiết
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
```

### 5. Connection String Security

#### Supabase/Neon Connection String Format:
```
postgresql://[user]:[password]@[host]:[port]/[database]?sslmode=require
```

**Security Tips:**
- Luôn sử dụng SSL (`sslmode=require`) cho production
- Rotate connection strings định kỳ
- Không log connection strings
- Sử dụng connection pooling để giảm số lượng connections

### 6. Code Security

#### ✅ Safe:
```javascript
// ✅ Good: Load from environment
const password = process.env.DB_PASSWORD;
```

#### ❌ Unsafe:
```javascript
// ❌ Bad: Hardcoded credentials
const password = "my_password_123";
```

### 7. Monitoring & Alerts

- Monitor database connections
- Set up alerts cho suspicious activities
- Log access attempts
- Review logs định kỳ

### 8. Backup & Recovery

- Regular database backups
- Test restore procedures
- Encrypt backups
- Store backups securely

## Checklist Before Deployment

- [ ] `.env` đã được thêm vào `.gitignore`
- [ ] `.env` không có trong git history
- [ ] Environment Variables đã được set trong Vercel
- [ ] Database user có least privileges
- [ ] SSL enabled cho production
- [ ] Strong passwords được sử dụng
- [ ] Connection strings không được log
- [ ] Firewall rules đã được configure

## If Credentials Are Exposed

1. **Immediately rotate passwords**
2. **Revoke old credentials**
3. **Check access logs**
4. **Review git history** (nếu đã commit nhầm)
5. **Update all environments**

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

