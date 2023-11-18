const Sequelize = require('sequelize');
const database = require('../utilities/database');

const Expense = database.define(
  'expenses',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    category: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    amount: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    indexes: [
      { fields: ['userId'] },
      { fields: ['category'] },
      { fields: ['category', 'userId'] },
    ],
  },
);

module.exports = Expense;
