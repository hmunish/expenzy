const express = require('express');
const { signup, signin, sendUserDetails } = require('../controllers/user');
const { authorization } = require('../middlewares/authorization');

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/', authorization, sendUserDetails);

module.exports = router;
