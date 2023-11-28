const express = require('express');
const { authorization } = require('../middlewares/authorization');
const { buyPremium, updateOrderStatus, getBudget } = require('../controllers/premium');
const { isPremium } = require('../middlewares/isPremium');

const router = express.Router();

router.use(authorization);
router.post('/buy', buyPremium);
router.post('/update', updateOrderStatus);
router.use('/features', isPremium);
router.get('/features/budget', getBudget);

module.exports = router;
