export const pocketbaseAuth = (req, res, next) => {
  const userId = req.headers['x-user-id'] || req.headers['x-pocketbase-user-id'];

  if (!userId) {
    return res.status(401).json({
      error: 'Missing authentication user ID. Provide x-user-id header.',
    });
  }

  req.pocketbaseUserId = userId;
  next();
};
