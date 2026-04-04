const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. Admins only.',
  });
};

const isAdminOrOwner = (getOwnerId) => (req, res, next) => {
  if (req.user.role === 'admin') return next();
  const ownerId = getOwnerId(req);
  if (ownerId && ownerId.toString() === req.user._id.toString()) return next();
  return res.status(403).json({
    success: false,
    message: 'Access denied. You are not the owner of this resource.',
  });
};

module.exports = { isAdmin, isAdminOrOwner };
