const transactionService = require("../services/transaction.service");

const add = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { walletId, type, amount, category, date } = req.body;

    const data = {
      userId: id,
      walletId,
      type,
      amount,
      category,
      date,
    };

    const result = await transactionService.addTransaction(data);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

const get = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { walletId, startDate, endDate, limit, offset } = req.query;

    const transactions = await transactionService.getTransactions({
      userId: id,
      walletId,
      startDate,
      endDate,
      limit: limit ? parseInt(limit) : 100,
      offset: offset ? parseInt(offset) : 0,
    });
    res.json(transactions);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { transactionId } = req.params;

    await transactionService.deleteTransaction({
      userId: id,
      transactionId,
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = { add, get, remove };
