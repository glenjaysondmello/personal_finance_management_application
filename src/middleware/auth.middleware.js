const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await pool.query(
      "SELECT id, email FROM users WHERE id = ?",
      [payload.id]
    );

    if (!rows.length)
      return res
        .status(401)
        .json({ message: "Invalid token (user not found)" });

    req.user = { id: rows[0].id, email: rows[0].email };

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Unauthorized", error: error.message });
  }
};

module.exports = authMiddleware;
