const Razorpay = require('razorpay');
const Order = require('../models/orders');
const User = require('../models/users');
const sequelize = require('../utilities/database');

const getIncomeGroupsTotals = async (userId, noOfGroups = 3) => {
  const groups = await sequelize.query(
    `SELECT category, SUM(amount) as total FROM expenses WHERE userId = ${userId} AND amount > 0 GROUP BY category ORDER BY total DESC LIMIT ${noOfGroups}`,
  );
  return groups;
};

const getExpenseGroupsTotals = async (userId, noOfGroups = 3) => {
  const groups = await sequelize.query(
    `SELECT category, SUM(amount) as total FROM expenses WHERE userId = ${userId} AND amount < 0 GROUP BY category ORDER BY total ASC LIMIT ${noOfGroups}`,
  );
  return groups;
};

exports.buyPremium = async (req, res) => {
  try {
    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const amount = 2500;

    return rzp.orders.create({ amount, currency: 'INR' }, async (err, order) => {
      if (err) {
        return res.status(501).send({ message: 'Error creating order' });
      }

      await Order.create({
        orderId: order.id,
        status: 'PENDING',
        userId: req.user.id,
      });

      return res.status(201).send({ order_id: order.id, key: rzp.key_id });
    });
  } catch (error) {
    return res.status(501).send({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, paymentId, status } = req.body;
    await Order.update({ paymentId, status }, { where: { orderId } });
    if (status === 'SUCCESS') {
      await User.update(
        { isPremium: true },
        { where: { id: req.user.id } },
      );
    }
    return res.status(200).send({ message: 'Request successfull' });
  } catch (error) {
    return res.status(501).send({ message: error.message });
  }
};

exports.getBudget = async (req, res) => {
  try {
    // eslint-disable-next-line max-len
    const [income, expense] = await Promise.allSettled([getIncomeGroupsTotals(req.user.id), getExpenseGroupsTotals(req.user.id)]);
    return res.status(200).send({ income: income.value, expense: expense.value });
  } catch (error) {
    return res.status(501).send({ message: error.message });
  }
};