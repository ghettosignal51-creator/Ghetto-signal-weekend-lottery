const express = require('express');
const cors = require('cors');
const { generateToken, hashPassword, comparePassword, verifyToken } = require('./utils/auth');

const app = express();
const port = process.env.PORT || 3000;

const users = [];

app.use(cors());
app.use(express.json());

const sanitizeUser = (user) => ({
  id: user.id,
  username: user.username,
  phone: user.phone,
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/auth/signup', async (req, res) => {
  const { username, phone, password } = req.body || {};

  if (!username || !phone || !password) {
    return res.status(400).json({ message: 'Username, phone, and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  const exists = users.some((user) => user.username === username || user.phone === phone);
  if (exists) {
    return res.status(409).json({ message: 'A user with that username or phone already exists.' });
  }

  const passwordHash = await hashPassword(password);
  const user = {
    id: `user_${Date.now()}`,
    username,
    phone,
    passwordHash,
  };

  users.push(user);

  const token = generateToken(user);
  return res.status(201).json({
    message: 'Account created successfully.',
    token,
    user: sanitizeUser(user),
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { phone, username, password } = req.body || {};

  if (!password || (!phone && !username)) {
    return res.status(400).json({ message: 'Phone or username and password are required.' });
  }

  const user = users.find((candidate) => {
    if (phone) {
      return candidate.phone === phone;
    }
    return candidate.username === username;
  });

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const token = generateToken(user);
  return res.json({
    message: 'Login successful.',
    token,
    user: sanitizeUser(user),
  });
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }

  const user = users.find((candidate) => candidate.id === decoded.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  return res.json({ user: sanitizeUser(user) });
});

app.listen(port, () => {
  console.log(`Quick Odds backend listening on http://localhost:${port}`);
});

module.exports = app;
