const { USER_ROLES } = require('../models/userModel');
const { hasPermission } = require('../services/authService');
const User = require('../models/userModel');

/**
 * Middleware to attach user to request based on X-Username header
 * This should be used before requireAuth
 * In production, use JWT tokens or session-based auth
 */
async function attachUser(req, res, next) {
  const username = req.headers['x-username'];
  
  if (username) {
    try {
      const user = await User.findOne({ username }).lean();
      if (user) {
        req.user = {
          username: user.username,
          role: user.role || 0,
          isVerified: user.isVerified || false,
          type: user.type
        };
      }
    } catch (error) {
      console.error('[Auth] Failed to lookup user:', error);
    }
  }
  
  next();
}

/**
 * Middleware to check if user is authenticated
 * This is a simple session-based check - in production, use JWT or sessions
 */
function requireAuth(req, res, next) {
  // For now, check if user info is in request (set by login session/token)
  if (!req.user) {
    return res.status(401).json({
      message: 'Authentication required. Please login first.'
    });
  }
  next();
}

/**
 * Middleware factory to require minimum role level
 * @param {number} requiredRole - Minimum role level required (from USER_ROLES)
 */
function requireRole(requiredRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Authentication required. Please login first.'
      });
    }

    if (!hasPermission(req.user.role, requiredRole)) {
      return res.status(403).json({
        message: 'Insufficient permissions. Access denied.'
      });
    }

    next();
  };
}

/**
 * Middleware to require admin privileges (highest level)
 */
function requireAdmin(req, res, next) {
  return requireRole(USER_ROLES.ADMIN)(req, res, next);
}

/**
 * Middleware to require VIP or higher privileges
 */
function requireVIP(req, res, next) {
  return requireRole(USER_ROLES.VIP)(req, res, next);
}

/**
 * Middleware to require verified user or higher privileges
 */
function requireVerified(req, res, next) {
  return requireRole(USER_ROLES.VERIFIED)(req, res, next);
}

module.exports = {
  attachUser,
  requireAuth,
  requireRole,
  requireAdmin,
  requireVIP,
  requireVerified,
  USER_ROLES
};
