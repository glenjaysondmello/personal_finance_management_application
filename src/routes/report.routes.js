const express = require("express");

const { monthlyReport } = require("../controllers/report.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", authMiddleware, monthlyReport);

module.exports = router;
