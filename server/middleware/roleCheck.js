const roleCheck = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        data: null,
        message: `Role '${req.user?.role}' is not authorized for this action`,
        error: null
      });
    }
    next();
  };
};

module.exports = { roleCheck };
