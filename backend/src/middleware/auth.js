const jwt=require("jsonwebtoken");

// Verifies the request's JWT and attaches the decoded user to req.user before letting it continue
function requireAuth(req, res, next) {
    const authHeader=req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({ error: "Missing token" });
    }

    const token = authHeader.split(" ")[1]; // header looks like "Bearer <token>", split on the space to grab just the token
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        // req.user ends up as { id, role, iat, exp }, so later controllers can read id/role without decoding anything
        req.user = payload;
        next();
  } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
  }
}
// Blocks the request unless req.user has the admin role. Always runs after requireAuth since it expects req.user to already be set
function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
