const jwt = require('jwt-simple');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET must be configured in production.');
}
const signingSecret = JWT_SECRET || 'local-development-only-secret-change-me';

const generateToken = (user) => jwt.encode({
  id: user.id,
  phone: user.phone,
  username: user.username,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (15 * 60)
}, signingSecret);

const verifyToken = (token) => {
  try {
    return jwt.decode(token, signingSecret);
  } catch (err) {
    return null;
  }
};

const generateRefreshToken = (userId) => jwt.encode({
  id: userId,
  type: 'refresh',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
}, signingSecret);

const hashPassword = (password) => bcrypt.hash(password, 10);
const comparePassword = (password, hash) => bcrypt.compare(password, hash);

module.exports = { generateToken, verifyToken, generateRefreshToken, hashPassword, comparePassword };
