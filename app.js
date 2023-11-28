const fs = require('fs');
const path = require('path');

// configuring environvenment variables
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const sanitizeRequestData = require('./middlewares/sanitize-request-data');

const database = require('./utilities/database');
const User = require('./models/users');
const Expense = require('./models/expenses');
const Order = require('./models/orders');

const userRouter = require('./routes/user');
const expenseRouter = require('./routes/expense');
const premiumRouter = require('./routes/premium');

const app = express();

// Sets required headers
app.use(helmet());

// Allow cors origin requests
app.use(cors());

// Parsing request body JSON data
app.use(bodyParser.json());

// Sanitizing incoming data for security threats using custom defined middleware
app.use(sanitizeRequestData);

// create a write stream for error logs (in append mode)
const errorLogStream = fs.createWriteStream(
  path.join(__dirname, 'logs/error.log'),
  {
    flags: 'a',
  },
);

// setup the logger for error
app.use(
  morgan('combined', {
    skip(req, res) {
      return res.statusCode < 400;
    },
    stream: errorLogStream,
  }),
);

// create a write stream for success logs (in append mode)
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'logs/access.log'),
  {
    flags: 'a',
  },
);

// setup the logger for success logs
app.use(
  morgan('combined', {
    skip(req, res) {
      return res.statusCode > 400;
    },
    stream: accessLogStream,
  }),
);

// Route for user
app.use('/user', userRouter);

// Route for expense
app.use('/expense', expenseRouter);

// Route for premium
app.use('/premium', premiumRouter);

// if request does not matches any route 404 response sent
app.use('/', (req, res) => res.status(404).send({ message: 'Path not found' }));

// Adding associations between database tables
User.hasMany(Expense);
Order.belongsTo(User);

// Creating connection with the database & listen on port for requests
database
  .sync()
  .then(() => {
    app.listen(process.env.PORT || 3000);
  })
  .catch((err) => {
    throw err;
  });
