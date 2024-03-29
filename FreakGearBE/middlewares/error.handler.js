function logErrors(err, req, res, next) {
  console.log('log errors')
  console.error(err);
  next(err);
}

function errorHandler(err, req, res, next) {
  console.log('error handler')
  res.status(500).json({
    message: err.message,
    stack: err.stack
  });
}

function boomErrorHandler(err, req, res, next) {
  console.log('error BOOM handler')
  console.log('ERROR IS ' + err)
  if(err.isBoom) {
    const { output } = err;
    res.status(output.statusCode).json(output.payload);
  }
  next(err);
}

module.exports = { logErrors, errorHandler, boomErrorHandler }