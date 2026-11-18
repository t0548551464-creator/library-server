const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  const payload = {
    id: user.id || user._id,
    code: user.code,
    role: user.role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5m' });
};

const checkAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

const checkAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin permission required.' });
  }
  next();
};

const checkSameUser = (req, res, next) => {
  const targetId = req.params.id || req.params.code;

  const isSameId = req.user?.id && String(req.user.id) === String(targetId);
  const isSameCode = req.user?.code !== undefined && String(req.user.code) === String(targetId);

  if (!isSameId && !isSameCode) {
    return res.status(403).json({ message: 'Access denied. You can only update your own details.' });
  }
  next();
};

const checkAdminOrSameUser = (req, res, next) => {
  const borrowerId = req.body?.userId || req.body?.userCode;

  const isAdmin = req.user?.role === 'admin';
  const isSameId = req.user?.id && borrowerId && String(req.user.id) === String(borrowerId);
  const isSameCode = req.user?.code !== undefined && borrowerId && String(req.user.code) === String(borrowerId);

  if (!isAdmin && !isSameId && !isSameCode) {
    return res.status(403).json({ message: 'Access denied. Admin or matching user required.' });
  }
  next();
};

module.exports = {
  generateToken,
  checkAuth,
  checkAdmin,
  checkSameUser,
  checkAdminOrSameUser,
};