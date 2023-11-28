exports.isPremium = async (req, res, next) => {
  try {
    // Validate if user is premium or else return with 402 payment required
    if (!req.user.isPremium) return res.status(402).send({ message: 'Payment required to access feature' });
    return next();
  } catch (error) {
    return res.status(401).send({ message: 'User not authorized' });
  }
};