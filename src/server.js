const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const walletRoutes = require("./routes/wallet.routes");
const transactionRoutes = require("./routes/transaction.routes");
const budgetRoutes = require("./routes/budget.routes");
const reportRoutes = require("./routes/report.routes");

const { errorHandler } = require("./middleware/error.middleware");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/wallets", walletRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/report", reportRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
