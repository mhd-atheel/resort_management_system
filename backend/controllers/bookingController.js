const Booking = require("../models/bookingModel");
const Room = require("../models/roomsModel");
const Customer = require("../models/customersModel");

const createBooking = async (req, res) => {

    try {
        const { roomID,customerID,payment,checkIn,checkOut } = req.body;

        const newBooking = new Booking({
            roomID,
            customerID,
            payment,
            checkIn,
            checkOut
          });

        await newBooking.save();

        const _id = roomID

        await Room.findOneAndUpdate(
            {_id },
            {
                $set:
                {
                    isAvailable: false,
                    
                },
            }
        );
      
        res.status(200).json({ status: "success" });


    } catch (error) {

        res.status(500).json({ error: "An error occurred" });

    }
}

const getAllBookings = async (req, res) => {
    try {
      
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.max(1, parseInt(req.query.limit) || 10);
      const search = req.query.search || "";
      const skip = (page - 1) * limit;
  
     
      const pipeline = [
        {
          $lookup: {
            from: "customers",        
            localField: "customerID", 
            foreignField: "_id",      
            as: "customerDetails",
          },
        },
        
        {
          $unwind: {
            path: "$customerDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
  
        {
          $lookup: {
            from: "rooms",
            localField: "roomID",
            foreignField: "_id",
            as: "roomDetails",
          },
        },
        {
          $unwind: {
            path: "$roomDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
  
       
        ...(search
          ? [
              {
                $match: {
                  $or: [
                    { "customerDetails.name": { $regex: search, $options: "i" } },
                    { "customerDetails.email": { $regex: search, $options: "i" } },
                    { "customerDetails.nic": { $regex: search, $options: "i" } },
                    { "roomDetails.roomID": { $regex: search, $options: "i" } }, 
                    { payment: { $regex: search, $options: "i" } }, 
                  ],
                },
              },
            ]
          : []),
  
       
        {
          $facet: {
            metadata: [{ $count: "total" }],
            data: [
              { $sort: { checkIn: -1 } }, 
              { $skip: skip },
              { $limit: limit },
            ],
          },
        },
      ];
  
      const result = await Booking.aggregate(pipeline);
  
      const data = result[0]?.data || [];
      const total = result[0]?.metadata[0]?.total || 0;
      const totalPages = Math.ceil(total / limit);
  
      res.status(200).json({
        data,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      });
  
    } catch (error) {
      console.error("Error in getAllBookings:", error);
      res.status(500).json({
        message: "Error fetching bookings",
        error: error.message,
        data: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
      });
    }
  };

  
const updateBookingById = async (req, res) => {
  try {
      const { id } = req.params;
      const { roomID, customerID, payment, checkIn, checkOut } = req.body;

     
      const existingBooking = await Booking.findById(id);

      if (!existingBooking) {
          return res.status(404).json({ message: "Booking not found" });
      }

      
      if (roomID && roomID.toString() !== existingBooking.roomID.toString()) {
         
          await Room.findByIdAndUpdate(existingBooking.roomID, { $set: { isAvailable: true } });
          
          
          await Room.findByIdAndUpdate(roomID, { $set: { isAvailable: false } });
      }

      
      const updatedBooking = await Booking.findByIdAndUpdate(
          id,
          {
              $set: {
                  ...(roomID && { roomID }),
                  ...(customerID && { customerID }),
                  ...(payment && { payment }),
                  ...(checkIn && { checkIn }),
                  ...(checkOut && { checkOut }),
              },
          },
          { new: true, runValidators: true }
      );

      res.status(200).json({ 
          status: "success", 
          message: "Booking updated successfully",
          data: updatedBooking 
      });

  } catch (error) {
      console.error("Error updating booking:", error);
      res.status(500).json({ error: "An error occurred while updating the booking" });
  }
};


const deleteBookingById = async (req, res) => {
  try {
      const { id } = req.params;

      
      const existingBooking = await Booking.findById(id);

      if (!existingBooking) {
          return res.status(404).json({ message: "Booking not found" });
      }

      const cleanupTasks = [];

      
      cleanupTasks.push(
          Room.findByIdAndUpdate(existingBooking.roomID, { $set: { isAvailable: true } })
      );

     
      cleanupTasks.push(
          Booking.findByIdAndDelete(id)
      );

      
      await Promise.all(cleanupTasks);

      res.status(200).json({ 
          status: "success", 
          message: "Booking deleted and room made available" 
      });

  } catch (error) {
      console.error("Error deleting booking:", error);
      res.status(500).json({ error: "An error occurred while deleting the booking" });
  }
};


const checkoutBooking = async (req, res) => {
  try {
      const { id } = req.params; 

      const booking = await Booking.findById(id);

      if (!booking) {
          return res.status(404).json({ message: "Booking not found" });
      }

      const checkoutTasks = [];

      checkoutTasks.push(
          Room.findByIdAndUpdate(booking.roomID, { $set: { isAvailable: true } })
      );

      checkoutTasks.push(
          Customer.findByIdAndUpdate(booking.customerID, { $unset: { roomID: "" } })
      );

      const bookingUpdates = { checkOut: new Date() }; 
      
      if (req.body.payment === "paid") {
          bookingUpdates.payment = "paid";
      }

      checkoutTasks.push(
          Booking.findByIdAndUpdate(id, { $set: bookingUpdates })
      );

      await Promise.all(checkoutTasks);

      res.status(200).json({ 
          status: "success", 
          message: "Checkout completed. Room is now available and checkout time recorded." 
      });

  } catch (error) {
      console.error("Error during checkout:", error);
      res.status(500).json({ error: "An error occurred during checkout" });
  }
};



module.exports = {
    createBooking,
    getAllBookings,
    updateBookingById, 
    deleteBookingById,
    checkoutBooking
}