const session = require('express-session');
const prisma = require('../prisma');

// Use the same database client as registration and profiles.
class PrismaSessionStore extends session.Store {
  get(sid, callback) {
    prisma.session.findUnique({ where: { sid } }).then((row) => {
      callback(null, row && row.expire > new Date() ? row.sess : null);
    }).catch(callback);
  }

  set(sid, value, callback) {
    const data = {
      sess: JSON.parse(JSON.stringify(value)),
      expire: new Date(value.cookie.expires || Date.now() + 7 * 24 * 60 * 60 * 1000)
    };
    prisma.session.upsert({ where: { sid }, create: { sid, ...data }, update: data })
      .then(() => callback(null)).catch(callback);
  }

  destroy(sid, callback) {
    prisma.session.deleteMany({ where: { sid } })
      .then(() => callback(null)).catch(callback);
  }

  touch(sid, value, callback) {
    prisma.session.updateMany({
      where: { sid },
      data: { expire: new Date(value.cookie.expires || Date.now() + 7 * 24 * 60 * 60 * 1000) }
    }).then(() => callback(null)).catch(callback);
  }
}

function sessionMiddleware() {
  const isProduction = process.env.NODE_ENV === 'production';
  const sessionSecret = process.env.SESSION_SECRET || 'dev-fallback-session-secret-change-in-production';

  const store = new PrismaSessionStore();

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
  PrismaSessionStore
};

