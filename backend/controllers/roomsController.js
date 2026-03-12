const Room = require("../models/roomsModel");



const createRoom = async (req, res) => {
    try {
        const { roomID, amount, roomType, isAvailable } = req.body;

        if (!roomID || !amount) {
            return res.status(400).json({ message: "Please provide roomID and amount" });
        }

        const existingRoom = await Room.findOne({ roomID });

        if (existingRoom) {
            return res.status(400).json({ message: "Room ID already exists" });
        }

        
        const room = await Room.create({
            roomID,
            amount,
            roomType,
            isAvailable,
        });

        res.status(201).json(room);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllRooms = async (req, res) => {
    try {
      const rooms = await Room.find();
      res.status(200).json(rooms);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};

const getAvailableRooms = async (req, res) => {

    try {
      const availableRooms = await Room.find({ isAvailable: true });
      
      res.status(200).json(availableRooms);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };


module.exports = {
    createRoom,
    getAllRooms,
    getAvailableRooms
}