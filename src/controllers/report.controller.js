const pool = require("../config/db");

async function monthlyReport(req, res, next) {
  try {
    const { id: userId } = req.user;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const now = new Date();
    const qMonth = req.query.month ? parseInt(req.query.month, 10) : null;
    const qYear = req.query.year ? parseInt(req.query.year, 10) : null;

    let month = Number.isInteger(qMonth) ? qMonth : now.getMonth() + 1;
    let year = Number.isInteger(qYear) ? qYear : now.getFullYear();

    if (month < 1 || month > 12) {
      return res.status(400).json({ message: "Invalid month (must be 1-12)" });
    }

    const lastDay = new Date(year, month, 0).getDate();

    const start = `${year}-${String(month).padStart(2, "0")}-01 00:00:00`;
    const end = `${year}-${String(month).padStart(2, "0")}-${String(
      lastDay
    ).padStart(2, "0")} 23:59:59`;

    const [incRows] = await pool.query(
      `SELECT IFNULL(SUM(t.amount), 0) AS totalIncome
       FROM transactions t
       JOIN wallets w ON t.walletId = w.id
       WHERE w.userId = ? AND t.type = 'income' AND t.date BETWEEN ? AND ?`,
      [userId, start, end]
    );

    const [expRows] = await pool.query(
      `SELECT IFNULL(SUM(t.amount), 0) AS totalExpense
       FROM transactions t
       JOIN wallets w ON t.walletId = w.id
       WHERE w.userId = ? AND t.type = 'expense' AND t.date BETWEEN ? AND ?`,
      [userId, start, end]
    );

    const totalIncome = parseFloat(incRows[0].totalIncome || 0);
    const totalExpense = parseFloat(expRows[0].totalExpense || 0);
    const netSavings = totalIncome - totalExpense;

    res.json({ month, year, totalIncome, totalExpense, netSavings });
  } catch (err) {
    next(err);
  }
}

module.exports = { monthlyReport };
