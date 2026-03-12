const express = require('express');
const { verifyCustomer, checkExistingCustomer, createCustomer,verifyCustomerOTP , getAllCustomers, getCustomersById, updateCustomerById, deleteCustomerById } = require('../controllers/customersController');
const router = express.Router();


router.post('/verify-customer',verifyCustomer);
router.post('/check-existing-customer',checkExistingCustomer);
router.put('/create-customer',createCustomer);
router.post('/verify-customer-otp',verifyCustomerOTP);


router.get('/get-all-customer',getAllCustomers);
router.get('/get-customer-by-id/:id',getCustomersById);

router.put('/update-customer-by-id/:id',updateCustomerById);

router.delete('/delete-customer-by-id/:id', deleteCustomerById);

module.exports = router