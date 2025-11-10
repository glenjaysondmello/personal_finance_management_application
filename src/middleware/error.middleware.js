const errorHandler = (err, req, res, next) => {
  console.error(err);

  const status = err.status || 500;
  const body = { message: err.message || "Internal Server Error" };

  if (err.stack) body.stack = err.stack;

  res.status(status).json(body);
};

module.exports = { errorHandler };
