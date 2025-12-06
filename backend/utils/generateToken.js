import jwt from 'jsonwebtoken';

/**
 * Generate JWT tokens for authentication
 * @param {string} userId - User ID to include in token
 * @returns {Object} Access and refresh tokens
 */
const generateToken = (userId) => {
  // Generate access token (15 minutes)
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  // Generate refresh token (7 days)
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

export default generateToken;