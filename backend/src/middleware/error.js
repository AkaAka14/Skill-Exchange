import logger from '../utils/logger.js';

export function errorMiddleware(err, req, res, next) {
  logger.error('Unhandled error:', err);
  const status = err?.status || 500;
  res.status(status).json({
    error: err?.message || 'Internal server error',
  });
}
