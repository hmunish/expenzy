const { Op } = require('sequelize');
const Expense = require('../models/expenses');

// Helper function to get expenses sum

const getExpenseTotal = async (userId) => {
  try {
    const expense = Math.abs(
      await Expense.sum('amount', {
        where: {
          userId,
          amount: {
            [Op.lt]: 0,
          },
        },
      }),
    );
    return expense;
  } catch (error) {
    return error;
  }
};

// Helper function to get income sum

const getIncomeTotal = async (userId) => {
  try {
    const income = await Expense.sum('amount', {
      where: {
        userId,
        amount: {
          [Op.gt]: 0,
        },
      },
    });
    return income;
  } catch (error) {
    return error;
  }
};

exports.getTransactions = async (req, res) => {
  try {
    // Extracting limit & page query parameters and
    // converting it to number if exist or setting default values
    const limit = +req.query.limit || 5;
    const page = +req.query.page || 0;

    // Fetching expenses for user with limit & offset values if exist or fetching all expenses
    const expenses = await Expense.findAll({
      ...(limit ? { limit } : {}),
      ...(page ? { offset: (page - 1) * limit } : {}),
      where: { userId: req.user.id },
      order: [
        ['createdAt', 'DESC'],
      ],
    });

    // Responding success with all fetched expenses
    res.send(expenses);
  } catch (error) {
    res.status(501).send({ message: 'Error fetching expenses' });
  }
};

exports.addTransaction = async (req, res) => {
  try {
    const { category, description, amount } = req.body;

    // Validating if required fields exists & are not empty
    if (!category || !description || !amount) {
      return res.status(400).send({
        message: 'Empty fields. Category, Description & Amount required',
      });
    }

    // Creating new expense for the current user
    const expense = await req.user.createExpense({
      category,
      description,
      amount,
    });

    // Returing created 201 with the expense created
    return res.status(201).send(expense);
  } catch (error) {
    return res.status(501).send({ message: 'Error adding expense' });
  }
};

exports.getTransactionTotals = async (req, res) => {
  try {
    const [income, expense] = await Promise.all([
      getIncomeTotal(req.user.id),
      getExpenseTotal(req.user.id),
    ]);

    return res.send({ income, expense });
  } catch (error) {
    return res.status(501).send({ message: 'Error fetching income' });
  }
};
