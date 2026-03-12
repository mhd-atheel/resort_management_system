const express = require('express');
const { createBooking, getAllBookings, updateBookingById, deleteBookingById, checkoutBooking } = require('../controllers/bookingController');
const router = express.Router();


router.post('/create-booking',createBooking);
router.get("/get-all-bookings", getAllBookings);

router.put('/update-booking/:id', updateBookingById);
router.delete('/delete-booking/:id', deleteBookingById);
router.put('/checkout/:id', checkoutBooking);


module.exports = router