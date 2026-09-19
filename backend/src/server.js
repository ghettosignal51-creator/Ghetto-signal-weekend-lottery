const express = require('express');
const path = require('path');
const cors = require('cors');
const { generateToken, hashPassword, comparePassword, verifyToken } = require('./utils/auth');

const app = express();
const port = process.env.PORT || 3000;
const users = [];
const frontendDirectory = path.resolve(__dirname, '../../dist');

app.use(cors({ origin: process.env.FRONTEND_URL || true }));
app.use(express.json());

const sanitizeUser = (user) => ({ id: user.id, username: user.username, phone: user.phone });

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.post('/api/auth/signup', async (req, res) => {
  const { username, phone, password } = req.body || {};
  if (!username || !phone || !password) return res.status(400).json({ message: 'Username, phone, and password are required.' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  if (users.some((user) => user.username === username || user.phone === phone)) return res.status(409).json({ message: 'A user with that username or phone already exists.' });
  const user = { id: `user_${Date.now()}`, username, phone, passwordHash: await hashPassword(password) };
  users.push(user);
  return res.status(201).json({ message: 'Account created successfully.', token: generateToken(user), user: sanitizeUser(user) });
});

app.post('/api/auth/login', async (req, res) => {
  const { phone, username, password } = req.body || {};
  if (!password || (!phone && !username)) return res.status(400).json({ message: 'Phone or username and password are required.' });
  const user = users.find((candidate) => (phone ? candidate.phone === phone : candidate.username === username));
  if (!user || !(await comparePassword(password, user.passwordHash))) return res.status(401).json({ message: 'Invalid credentials.' });
  return res.json({ message: 'Login successful.', token: generateToken(user), user: sanitizeUser(user) });
});

app.get('/api/auth/me', (req, res) => {
  const token = (req.headers.authorization || '').startsWith('Bearer ') ? req.headers.authorization.slice(7) : null;
  const decoded = token && verifyToken(token);
  if (!decoded) return res.status(401).json({ message: 'Invalid or expired token.' });
  const user = users.find((candidate) => candidate.id === decoded.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  return res.json({ user: sanitizeUser(user) });
});

// In production, serve the built game and authentication page from this same server.
app.use(express.static(frontendDirectory));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  return res.sendFile(path.join(frontendDirectory, 'index.html'));
});

if (require.main === module) app.listen(port, () => console.log(`Quick Odds listening on port ${port}`));
module.exports = app;
