const express = require('express');
const { createRoom, getAvailableRooms, getAllRooms } = require('../controllers/roomsController');
const router = express.Router();


router.post('/create-room',createRoom);
router.get("/available", getAvailableRooms);
router.get("/", getAllRooms);


module.exports = router