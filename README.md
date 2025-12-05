<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1cl2p9PzR8fFXS5l05oJHuk_QQGqdcAyq

## Run Locally

**Prerequisites:**  Node.js and PostgreSQL

1. Install dependencies:
   ```bash
   npm install
   ```

2. Setup environment variables:
   ```bash
   # Copy example file
   cp .env.example .env
   
   # Edit .env and fill in your database credentials
   # NEVER commit .env file to git!
   ```

3. Setup database:
   ```bash
   # Create database
   createdb app_hub
   
   # Run migrations
   psql -d app_hub -f schema.sql
   psql -d app_hub -f alter_table_add_image.sql
   ```

4. Run the app:
   ```bash
   npm run dev
   ```

   App will run on `http://localhost:3000`
   API will be available at `http://localhost:3000/api/v1`

## 🔒 Security

**IMPORTANT:** 
- Never commit `.env` file to git
- Use strong passwords for database
- Enable SSL for production databases
- See [SECURITY.md](SECURITY.md) for detailed security guidelines

## 📚 Documentation

- [Deployment Guide](QUICK_DEPLOY.md) - Deploy to Vercel
- [Security Guide](SECURITY.md) - Security best practices
