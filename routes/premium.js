const express = require('express');
const { authorization } = require('../middlewares/authorization');
const { buyPremium, updateOrderStatus } = require('../controllers/premium');

const router = express.Router();

router.use(authorization);
router.post('/buy', buyPremium);
router.post('/update', updateOrderStatus);

module.exports = router;
