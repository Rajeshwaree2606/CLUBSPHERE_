// --------------------------------------------------
// src/utils/generateToken.js — JWT token generator
// --------------------------------------------------

const jwt = require("jsonwebtoken");

/**
 * generateToken — Creates a signed JWT for the given user.
 *
 * @param {object} user - User object (must have id, email, role)
 * @returns {string} Signed JWT token
 */
const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

module.exports = generateToken;
