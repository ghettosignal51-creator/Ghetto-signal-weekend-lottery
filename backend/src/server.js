const express = require('express');
const cors = require('cors');
const path = require('path');
const { generateToken, hashPassword, comparePassword, verifyToken } = require('./utils/auth');
const { ensureDatabase, createUserRecord, findUserByPhoneOrUsername, findUserById, doesUserExist, getUserPasswordHash } = require('./db');

const app = express();
const port = process.env.PORT || 3000;
const frontendDirectory = path.resolve(__dirname, '../../dist');

app.use(cors({ origin: process.env.FRONTEND_URL || true }));
app.use(express.json());

const sanitizeUser = (user) => ({ id: user.id, username: user.username, phone: user.phone });

app.get('/api/health', async (req, res) => {
  const databaseReady = await ensureDatabase();
  res.json({ status: 'ok', timestamp: new Date().toISOString(), database: databaseReady ? 'connected' : 'memory-fallback' });
});

app.post('/api/auth/signup', async (req, res) => {
  const { username, phone, password } = req.body || {};

  if (!username || !phone || !password) {
    return res.status(400).json({ message: 'Username, phone, and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  const existingUser = await doesUserExist({ username, phone });
  if (existingUser) {
    return res.status(409).json({ message: 'A user with that username or phone already exists.' });
  }

  const user = {
    id: `user_${Date.now()}`,
    username,
    phone,
    passwordHash: await hashPassword(password),
  };

  const savedUser = await createUserRecord(user);
  const token = generateToken({ ...savedUser, username: savedUser.username, phone: savedUser.phone });

  return res.status(201).json({
    message: 'Account created successfully.',
    token,
    user: sanitizeUser(savedUser),
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { phone, username, password } = req.body || {};

  if (!password || (!phone && !username)) {
    return res.status(400).json({ message: 'Phone or username and password are required.' });
  }

  const user = await findUserByPhoneOrUsername({ phone, username });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const passwordHash = getUserPasswordHash(user);
  const isValid = await comparePassword(password, passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const token = generateToken({
    id: user.id,
    username: user.username,
    phone: user.phone,
  });

  return res.json({
    message: 'Login successful.',
    token,
    user: sanitizeUser(user),
  });
});

app.get('/api/auth/me', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }

  const user = await findUserById(decoded.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  return res.json({ user: sanitizeUser(user) });
});

app.use(express.static(frontendDirectory));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  return res.sendFile(path.join(frontendDirectory, 'index.html'));
});

const startServer = async () => {
  await ensureDatabase();
  app.listen(port, () => console.log(`Quick Odds listening on port ${port}`));
};

if (require.main === module) {
  startServer();
}

module.exports = app;
