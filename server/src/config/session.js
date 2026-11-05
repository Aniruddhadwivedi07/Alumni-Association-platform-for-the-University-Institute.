const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');

let sessionPool = null;

function getSessionPool() {
  if (!sessionPool) {
    sessionPool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
  }
  return sessionPool;
}

function sessionMiddleware() {
  const isProduction = process.env.NODE_ENV === 'production';
  const sessionSecret = process.env.SESSION_SECRET || 'dev-fallback-session-secret-change-in-production';

  const store = new PgSession({
    pool: getSessionPool(),
    tableName: 'session',
    createTableIfMissing: false
  });

  return session({
    store,
    name: 'sid',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    }
  });
}

module.exports = {
  sessionMiddleware,
  getSessionPool
};

