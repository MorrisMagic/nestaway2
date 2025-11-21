const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  console.log('=== Auth Middleware ===');
  console.log('Request method:', req.method);
  console.log('Request path:', req.path);
  const token = req.cookies.token;
  console.log('Token present:', !!token);
  
  if (!token) {
    console.log('No token found');
    return res.status(401).json({ msg: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    console.log('Token verified, userId:', req.userId);
    next();
  } catch (err) {
    console.log('Token verification failed:', err.message);
    return res.status(401).json({ msg: "Invalid token" });
  }
}

module.exports = authMiddleware;
