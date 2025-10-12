const express = require('express');
const { createUser, loginUser, verifyUserOTP } = require('../controllers/userController');
const router = express.Router();


router.post('/create-user',createUser);
router.post('/login-user',loginUser);
router.post('/verify-user',verifyUserOTP);


module.exports = router