const { Pool } = require('pg');

const databaseUrl = process.env.DATABASE_URL;
let pool = null;
let usesDatabase = false;

const memoryUsers = [];

const ensureDatabase = async () => {
  if (!databaseUrl) {
    return false;
  }

  try {
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    usesDatabase = true;
    return true;
  } catch (error) {
    console.error('Database initialization failed, falling back to in-memory storage:', error.message);
    usesDatabase = false;
    pool = null;
    return false;
  }
};

const getUserPasswordHash = (user) => user.passwordHash || user.password_hash;

const createUserRecord = async ({ id, username, phone, passwordHash }) => {
  if (usesDatabase && pool) {
    const result = await pool.query(
      'INSERT INTO users (id, username, phone, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, username, phone, password_hash',
      [id, username, phone, passwordHash]
    );

    const row = result.rows[0];
    return {
      id: row.id,
      username: row.username,
      phone: row.phone,
      password_hash: row.password_hash,
    };
  }

  const user = { id, username, phone, passwordHash };
  memoryUsers.push(user);
  return user;
};

const findUserByPhoneOrUsername = async ({ phone, username }) => {
  if (usesDatabase && pool) {
    const result = await pool.query(
      'SELECT id, username, phone, password_hash FROM users WHERE phone = $1 OR username = $2 LIMIT 1',
      [phone || '', username || '']
    );

    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      id: row.id,
      username: row.username,
      phone: row.phone,
      password_hash: row.password_hash,
    };
  }

  return memoryUsers.find((candidate) => {
    if (phone) return candidate.phone === phone;
    return candidate.username === username;
  }) || null;
};

const findUserById = async (id) => {
  if (usesDatabase && pool) {
    const result = await pool.query(
      'SELECT id, username, phone, password_hash FROM users WHERE id = $1 LIMIT 1',
      [id]
    );

    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      id: row.id,
      username: row.username,
      phone: row.phone,
      password_hash: row.password_hash,
    };
  }

  return memoryUsers.find((candidate) => candidate.id === id) || null;
};

const doesUserExist = async ({ username, phone }) => {
  if (usesDatabase && pool) {
    const result = await pool.query(
      'SELECT 1 FROM users WHERE username = $1 OR phone = $2 LIMIT 1',
      [username, phone]
    );
    return result.rows.length > 0;
  }

  return memoryUsers.some((user) => user.username === username || user.phone === phone);
};

module.exports = {
  ensureDatabase,
  createUserRecord,
  findUserByPhoneOrUsername,
  findUserById,
  doesUserExist,
  getUserPasswordHash,
  memoryUsers,
  usesDatabase,
};
