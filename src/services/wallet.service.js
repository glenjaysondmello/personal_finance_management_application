const pool = require("../config/db");

const createWallet = async (userId, name) => {
  try {
    const [result] = await pool.query(
      "INSERT INTO wallets (userId, name, balance) VALUES (?, ?, 0)",
      [userId, name]
    );

    const [rows] = await pool.query("SELECT * FROM wallets WHERE id = ?", [
      result.insertId,
    ]);

    return rows[0];
  } catch (error) {
    console.error("Error creating wallet:", error);
    throw error;
  }
};

const listWallets = async (userId) => {
  try {
    const [rows] = await pool.query("SELECT * FROM wallets WHERE userId = ?", [
      userId,
    ]);

    return rows;
  } catch (error) {
    console.error("Error listing wallets:", error);
    throw error;
  }
};

const deleteWallet = async (userId, walletId) => {
  try {
    const [rows] = await pool.query(
      "SELECT id FROM wallets WHERE id = ? AND userId = ?",
      [walletId, userId]
    );

    if (!rows.length) throw { status: 404, message: "Wallet not found" };

    await pool.query("DELETE FROM wallets WHERE id = ?", [walletId]);
    return true;
  } catch (error) {
    console.error("Error deleting wallet:", error);
    throw error;
  }
};

module.exports = { createWallet, listWallets, deleteWallet };
