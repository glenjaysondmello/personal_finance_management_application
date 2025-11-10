const walletService = require("../services/wallet.service");

const create = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { name } = req.body;

    const wallet = await walletService.createWallet(id, name);
    res.status(201).json(wallet);
  } catch (err) {
    next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const { id } = req.user;
    const wallets = await walletService.listWallets(id);
    res.json(wallets);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.user;
    await walletService.deleteWallet(id, req.params.walletId);
    res.status(204).json({ message: "Wallet deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = { create, list, remove };
