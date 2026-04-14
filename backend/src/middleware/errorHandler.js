function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';
  res.status(status).json({
    timestamp: new Date().toISOString(),
    status,
    message,
  });
}

function notFound(err, status, res) {
  res.status(status).json({
    timestamp: new Date().toISOString(),
    status,
    message: err,
  });
}

module.exports = { errorHandler, notFound };
