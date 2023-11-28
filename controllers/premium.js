const Razorpay = require('razorpay');
const Order = require('../models/orders');
const User = require('../models/users');

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