const pool = require("../config/db");

async function monthlyReport(req, res, next) {
  try {
    const { id: userId } = req.user;
    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year = parseInt(req.query.year) || now.getFullYear();
    const start = `${year}-${String(month).padStart(2, "0")}-01`;
    const end = `${year}-${String(month).padStart(2, "0")}-31`;

    const [incRows] = await pool.query(
      `SELECT IFNULL(SUM(t.amount),0) AS totalIncome FROM transactions t JOIN wallets w ON t.walletId = w.id WHERE w.userId = ? AND t.type = 'income' AND t.date BETWEEN ? AND ?`,
      [userId, start, end]
    );
    const [expRows] = await pool.query(
      `SELECT IFNULL(SUM(t.amount),0) AS totalExpense FROM transactions t JOIN wallets w ON t.walletId = w.id WHERE w.userId = ? AND t.type = 'expense' AND t.date BETWEEN ? AND ?`,
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
