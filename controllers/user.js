const validator = require('validator');
const bcrypt = require('bcrypt');
const User = require('../models/users');
const { getJWT } = require('../utilities/jwt-helper');

exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validating if required fields exists & are not empty
    if (!email || !password) {
      throw new Error('Empty fields. Email & Password both required');
    }

    // Validating required fields are in correct & required format
    const errorMessage = [];
    if (!validator.isEmail(email)) errorMessage.push('Invalid EmailId');
    if (!validator.isStrongPassword(password)) {
      errorMessage.push('Invalid Password');
    }

    // If any error exists throwing new error with custom message
    if (errorMessage.length) throw new Error(errorMessage.join(', '));

    // Validating if user already exists in the database
    const isUser = await User.findOne({ where: { email } });

    // If user exist return with 409 conflict response
    if (isUser) return res.status(409).send({ message: 'User already exist' });

    // If user is new, encrypting password & storing in database
    return bcrypt.hash(password, 10, async (err, hash) => {
      try {
        if (err) throw err;
        await User.create({ email, password: hash });
        return res.status(201).send({ message: 'User created successfully' });
      } catch (error) {
        return res.status(500).send({ message: 'Error creating user' });
      }
    });
  } catch (error) {
    return res.status(501).send({ message: error.message });
  }
};

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validating if required fields exists & are not empty
    if (!email || !password) {
      throw new Error('Empty fields. Email & Password both required');
    }

    // Validating if user exist
    const isUser = await User.findOne({ where: { email } });

    // If user not found returning with 404 not found response
    if (!isUser) return res.status(404).send({ message: 'User not found' });

    // If user found, matching password with stored password hash
    return bcrypt.compare(password, isUser.password, (err, result) => {
      try {
        if (err) throw err;
        if (result) {
          return res.status(200).send({
            message: 'User successfully authorized',
            authorization: getJWT(isUser.id),
          });
        }
        return res.status(401).send({ message: "Password doesn't match" });
      } catch (error) {
        return res.status(500).send({ message: 'Error authenticating user.' });
      }
    });
  } catch (error) {
    return res.status(401).send({ message: error.message });
  }
};

exports.sendUserDetails = (req, res) => {
  res.send(req.user);
};
