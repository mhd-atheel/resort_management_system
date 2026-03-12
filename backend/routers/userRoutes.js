const express = require('express');
const { createUser, loginUser, verifyUserOTP, userMe, getAllUsers, updateUserById, deleteUserById } = require('../controllers/userController');
const  verifyToken  = require('../middleware/auth.middleware');
const router = express.Router();


router.post('/create-user',createUser);
router.post('/login-user',loginUser);
router.post('/verify-user',verifyUserOTP);
router.get('/me',verifyToken,userMe);
router.get('/users',getAllUsers);


router.put('/update-user/:id', updateUserById);
router.delete('/delete-user/:id', deleteUserById);


module.exports = router