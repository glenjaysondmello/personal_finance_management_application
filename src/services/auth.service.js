const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

const register = async (email, password) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [existingUser] = await conn.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length) {
      await conn.rollback();
      throw { status: 409, message: "Email already in use" };
    }

    const passwordHash = await bcrypt.hash(password, saltRounds);

    const [result] = await conn.query(
      "INSERT INTO users (email, passwordHash) VALUES (?, ?)",
      [email, passwordHash]
    );

    const userId = result.insertId;

    await conn.commit();

    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    return { user: { id: userId, email }, token };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

const login = async (email, password) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, email, passwordHash FROM users WHERE email = ?",
      [email]
    );

    if (!rows.length) {
      throw { status: 401, message: "Invalid email" };
    }

    const user = rows[0];

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      throw { status: 401, message: "Invalid password" };
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

    return { user: { id: user.id, email: user.email }, token };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  register,
  login,
};
