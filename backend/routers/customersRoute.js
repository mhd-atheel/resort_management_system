const express = require('express');
const { verifyCustomer, checkExistingCustomer, createCustomer,verifyCustomerOTP , getAllCustomers, getCustomersById } = require('../controllers/customersController');
const router = express.Router();


router.post('/verify-customer',verifyCustomer);
router.post('/check-existing-customer',checkExistingCustomer);
router.post('/create-customer',createCustomer);
router.post('/verify-customer-otp',verifyCustomerOTP);


router.get('/get-all-customer',getAllCustomers);
router.get('/get-customer-by-id/:id',getCustomersById);


module.exports = router