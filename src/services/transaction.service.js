const pool = require("../config/db");

const addTransaction = async ({
  userId,
  walletId,
  type,
  amount,
  category,
  date,
}) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [walletRows] = await conn.query(
      "SELECT * FROM wallets WHERE id = ? AND userId = ? FOR UPDATE",
      [walletId, userId]
    );

    if (!walletRows.length) throw { status: 404, message: "Wallet not found" };

    const wallet = walletRows[0];

    const [ins] = await conn.query(
      "INSERT INTO transactions (walletId, userId, type, amount, category, date) VALUES (?, ?, ?, ?, ?, ?)",
      [walletId, userId, type, amount, category, date]
    );

    const delta = type === "income" ? parseFloat(amount) : -parseFloat(amount);
    const newBalance = parseFloat(wallet.balance) + delta;

    await conn.query("UPDATE wallets SET balance = ? WHERE id = ?", [
      newBalance,
      walletId,
    ]);

    await conn.commit();

    return { transactionId: ins.insertId };
  } catch (error) {
    await conn.rollback();
    console.error("Error adding transaction:", error);
    throw error;
  } finally {
    conn.release();
  }
};

const getTransactions = async ({
  userId,
  walletId,
  startDate,
  endDate,
  limit = 100,
  offset = 0,
}) => {
  try {
    const params = [userId];

    let sql = `SELECT t.* FROM transactions t JOIN wallets w ON t.walletId = w.id WHERE w.userId = ?`;

    if (walletId) {
      sql += " AND w.id = ?";
      params.push(walletId);
    }

    if (startDate && endDate) {
      sql += " AND t.date BETWEEN ? AND ?";
      params.push(startDate, endDate);
    } else if (startDate) {
      sql += " AND t.date >= ?";
      params.push(startDate);
    } else if (endDate) {
      sql += " AND t.date <= ?";
      params.push(endDate);
    }

    sql += " ORDER BY t.date DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
};

const deleteTransaction = async ({ userId, transactionId }) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [txRows] = await conn.query(
      "SELECT * FROM transactions WHERE id = ? FOR UPDATE",
      [transactionId]
    );

    if (!txRows.length) throw { status: 404, message: "Transaction not found" };
    const tx = txRows[0];

    const [walletRows] = await conn.query(
      "SELECT * FROM wallets WHERE id = ? FOR UPDATE",
      [tx.walletId]
    );

    if (!walletRows.length) throw { status: 404, message: "Wallet not found" };
    const wallet = walletRows[0];

    if (wallet.userId !== userId) throw { status: 403, message: "Not allowed" };

    const newBalance =
      tx.type === "income"
        ? parseFloat(wallet.balance) - parseFloat(tx.amount)
        : parseFloat(wallet.balance) + parseFloat(tx.amount);

    await conn.query("UPDATE wallets SET balance = ? WHERE id = ?", [
      newBalance,
      wallet.id,
    ]);

    await conn.query("DELETE FROM transactions WHERE id = ?", [transactionId]);

    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    console.error("Error deleting transaction:", err);
    throw err;
  } finally {
    conn.release();
  }
};

module.exports = {
  addTransaction,
  getTransactions,
  deleteTransaction,
};
