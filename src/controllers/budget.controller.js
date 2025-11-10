const budgetService = require("../services/budget.service");

const create = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { category, amount, month, year } = req.body;

    const b = await budgetService.setBudget({
      userId: id,
      category,
      amount,
      month,
      year,
    });
    res.status(201).json(b);
  } catch (err) {
    next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const { id } = req.user;
    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year = parseInt(req.query.year) || now.getFullYear();

    const budgets = await budgetService.getBudgetsForMonth({
      userId: id,
      month,
      year,
    });
    res.json(budgets);
  } catch (err) {
    next(err);
  }
};

module.exports = { create, list };
