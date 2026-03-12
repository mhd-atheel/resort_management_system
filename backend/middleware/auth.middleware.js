const  { verifyJwt } =  require("../services/jwt.service.js");


const verifyToken = (req, res, next) => {
  try {
    const bearer = req.headers.authorization;
    const headerToken = bearer?.startsWith("Bearer ") ? bearer.split(" ")[1] : null;
    const bodyToken = req.body?.token;
    const token = headerToken || bodyToken;

    if (!token) {
      return res.status(401).json({ message: "Token not found" });
    }

    const decoded = verifyJwt(token); // throws if invalid/expired
    req.user = decoded;               // { userId, email, ... }
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

module.exports = verifyToken
