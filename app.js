const fs = require('fs');
const path = require('path');

// configuring environvenment variables
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const sequelize = require('./utilities/database');

const app = express();

// Sets required headers
app.use(helmet());

// Allow cors origin requests
app.use(cors());

// Parsing request body JSON data
app.use(bodyParser.json());

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

// if request does not matches any route 404 response sent
app.use('/', (req, res) => res.status(404).send({ message: 'Path not found' }));

// Creating connection with the database & listen on port for requests
sequelize
  .sync()
  .then(() => {
    app.listen(process.env.PORT || 3000);
  })
  .catch((err) => {
    throw err;
  });
