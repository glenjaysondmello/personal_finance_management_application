const express = require("express");
const router = express.Router();
const { create, list, remove } = require("../controllers/wallet.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

router.post("/", authMiddleware, create);
router.get("/", authMiddleware, list);
router.delete("/:walletId", authMiddleware, remove);
module.exports = router;
