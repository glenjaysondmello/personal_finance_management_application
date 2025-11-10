const pool = require("../config/db");

const addBudget = async ({ userId, category, amount, month, year }) => {
  try {
    const [rows] = await pool.query(
      "SELECT id FROM budgets WHERE userId = ? AND category = ? AND month = ? AND year = ?",
      [userId, category, month, year]
    );

    if (rows.length) {
      await pool.query("UPDATE budgets SET amount = ? WHERE id = ?", [
        amount,
        rows[0].id,
      ]);

      const [updated] = await pool.query("SELECT * FROM budgets WHERE id = ?", [
        rows[0].id,
      ]);

      return updated[0];
    } else {
      const [ins] = await pool.query(
        "INSERT INTO budgets (userId, category, amount, month, year) VALUES (?, ?, ?, ?, ?)",
        [userId, category, amount, month, year]
      );

      const [created] = await pool.query("SELECT * FROM budgets WHERE id = ?", [
        ins.insertId,
      ]);

      return created[0];
    }
  } catch (error) {
    console.error("Error adding budget:", error);
    throw error;
  }
};

const getBudgetsForMonth = async (userId, month, year) => {
  try {
    const [budgets] = await pool.query(
      "SELECT * FROM budgets WHERE userId = ? AND month = ? AND year = ?",
      [userId, month, year]
    );

    const results = [];

    const [sumRows] = await pool.query(
      `SELECT IFNULL(SUM(amount),0) as spent FROM transactions WHERE userId = ? AND type='expense' AND category = ? AND date BETWEEN ? AND ?`,
      [
        userId,
        b.category,
        `${year}-${String(month).padStart(2, "0")}-01`,
        `${year}-${String(month).padStart(2, "0")}-31`,
      ]
    );

    results.push({
      id: b.id,
      category: b.category,
      budgetAmount: parseFloat(b.amount),
      spent: parseFloat(sumRows[0].spent || 0),
      month: b.month,
      year: b.year,
    });

    return results;
  } catch (error) {
    console.error("Error fetching budgets:", error);
    throw error;
  }
};

module.exports = { addBudget, getBudgetsForMonth };
