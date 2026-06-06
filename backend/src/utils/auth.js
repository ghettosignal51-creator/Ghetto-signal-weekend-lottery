const jwt = require('jwt-simple');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// Generate JWT token
const generateToken = (user) => {
  const payload = {
    id: user.id,
    phone: user.phone,
    username: user.username,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (15 * 60) // 15 minutes
  };
  return jwt.encode(payload, JWT_SECRET);
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    const decoded = jwt.decode(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
};

// Generate refresh token (7 days)
const generateRefreshToken = (userId) => {
  const payload = {
    id: userId,
    type: 'refresh',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
  };
  return jwt.encode(payload, JWT_SECRET);
};

// Hash password
const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

// Compare passwords
const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

module.exports = {
  generateToken,
  verifyToken,
  generateRefreshToken,
  hashPassword,
  comparePassword
};
