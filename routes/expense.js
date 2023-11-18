const express = require('express');
const { authorization } = require('../middlewares/authorization');
const {
  getTransactions,
  addTransaction,
  getTransactionTotals,
} = require('../controllers/expense');

const router = express.Router();

router.use(authorization);
router.get('/', getTransactions);
router.get('/total', getTransactionTotals);
router.post('/', addTransaction);

module.exports = router;
