const express = require("express");

const { add, get, remove } = require("../controllers/transaction.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", authMiddleware, add);
router.get("/", authMiddleware, get);
router.delete("/:transactionId", authMiddleware, remove);

module.exports = router;
