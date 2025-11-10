const express = require("express");

const { create, list } = require("../controllers/budget.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", authMiddleware, create);
router.get("/", authMiddleware, list);

module.exports = router;
