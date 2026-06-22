/**
 * Wraps async route handlers and forwards errors to the global error handler,
 * removing the need for repetitive try/catch blocks in controllers.
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
