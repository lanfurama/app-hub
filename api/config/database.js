import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Helper function to check if host is localhost
const isLocalhost = (host) => {
  if (!host) return true;
  const hostLower = String(host).toLowerCase();
  return hostLower === 'localhost' || 
         hostLower === '127.0.0.1' || 
         hostLower.includes('localhost') ||
         hostLower.includes('127.0.0.1') ||
         hostLower === '::1';
};

// Determine if we're in local development
const isLocalDev = () => {
  // Check if DATABASE_URL exists and contains localhost
  if (process.env.DATABASE_URL) {
    return isLocalhost(process.env.DATABASE_URL);
  }
  
  // Check DB_HOST
  const host = process.env.DB_HOST;
  if (!host || host === 'localhost' || host === '127.0.0.1') {
    return true;
  }
  
  return isLocalhost(host);
};

// Support both connection string (Supabase/Neon) and individual variables (Vercel Postgres)
let poolConfig;

const isLocal = isLocalDev();

if (process.env.DATABASE_URL) {
  // Using connection string
  // Remove sslmode from connection string if it's localhost
  let connectionString = process.env.DATABASE_URL;
  if (isLocal) {
    // Remove any sslmode parameters from connection string
    connectionString = connectionString.replace(/[?&]sslmode=[^&]*/gi, '');
  }
  
  poolConfig = {
    connectionString: connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
  
  // Only add ssl config for remote databases
  if (!isLocal) {
    poolConfig.ssl = { rejectUnauthorized: false };
  }
  // For localhost, don't set ssl property at all
} else {
  // Using individual variables
  const host = process.env.DB_HOST || 'localhost';
  
  poolConfig = {
    host: host,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'app_hub',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
  
  // SSL configuration: 
  // - For localhost: don't set ssl at all
  // - For remote: only enable SSL if DB_SSL=true, otherwise don't set ssl property
  if (!isLocal) {
    // Remote database - only enable SSL if explicitly requested
    if (process.env.DB_SSL === 'true' || process.env.DB_SSL === '1') {
      poolConfig.ssl = { rejectUnauthorized: false };
    }
    // If DB_SSL is not set or false, don't set ssl property at all
    // This prevents pg library from trying to use SSL
  }
  // For localhost, don't set ssl property at all
}

// ⚠️ SECURITY: Removed debug logging to prevent information leakage
// Database config should not be logged, even in development

const pool = new Pool(poolConfig);

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err.message);
  // Don't exit in development to allow server to continue
  if (process.env.NODE_ENV === 'production') {
    process.exit(-1);
  }
});

export default pool;

