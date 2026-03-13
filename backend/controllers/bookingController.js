const Booking = require("../models/bookingModel");
const Room = require("../models/roomsModel");
const Customer = require("../models/customersModel");
const { mailConfig } = require("../utils/mailConfig");

const createBooking = async (req, res) => {
  try {
      const { roomID, customerID, payment, checkIn, checkOut } = req.body;

      const customer = await Customer.findById(customerID);
      const room = await Room.findById(roomID);

      if (!customer || !room) {
          return res.status(404).json({ message: "Customer or Room not found" });
      }

      const newBooking = new Booking({
          roomID,
          customerID,
          payment,
          checkIn,
          checkOut
      });

      await newBooking.save();

      await Room.findByIdAndUpdate(
          roomID,
          { $set: { isAvailable: false } }
      );
    
      
      const subject = 'Booking Confirmed! - Resort Management System';
      const formattedCheckIn = new Date(checkIn).toDateString();
      const formattedCheckOut = new Date(checkOut).toDateString();
      
      
      const badgeBg = payment === 'paid' ? '#dcfce7' : '#fef3c7';
      const badgeColor = payment === 'paid' ? '#166534' : '#92400e';

      
      const plainText = `Dear ${customer.name}, your booking for Room ${room.roomID} from ${formattedCheckIn} to ${formattedCheckOut} is confirmed.`;

      
      const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #334155; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          
          <div style="background-color: #193948; padding: 30px 20px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 600; letter-spacing: 0.5px;">Reservation Confirmed</h1>
              <p style="margin: 10px 0 0 0; font-size: 15px; color: #cbd5e1;">We are thrilled to host you!</p>
          </div>

          <div style="padding: 40px 30px; background-color: #ffffff;">
              <p style="font-size: 16px; margin-top: 0;">Dear <strong>${customer.name}</strong>,</p>
              <p style="font-size: 16px; line-height: 1.6; color: #475569;">Your booking has been successfully processed. Below are the details of your upcoming stay with us:</p>

              <div style="background-color: #f8fafc; border-radius: 8px; padding: 25px; margin: 30px 0; border-left: 5px solid #3128B7;">
                  <table style="width: 100%; font-size: 15px; border-collapse: collapse;">
                      <tr>
                          <td style="padding: 10px 0; color: #64748b; border-bottom: 1px solid #e2e8f0;">Room Details</td>
                          <td style="padding: 10px 0; font-weight: 600; text-align: right; border-bottom: 1px solid #e2e8f0; color: #0f172a;">
                              Room ${room.roomID} <span style="font-size: 13px; color: #64748b; text-transform: capitalize; font-weight: normal;">(${room.roomType})</span>
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 0; color: #64748b; border-bottom: 1px solid #e2e8f0;">Check-In</td>
                          <td style="padding: 10px 0; font-weight: 600; text-align: right; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${formattedCheckIn}</td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 0; color: #64748b; border-bottom: 1px solid #e2e8f0;">Check-Out</td>
                          <td style="padding: 10px 0; font-weight: 600; text-align: right; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${formattedCheckOut}</td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 0 0 0; color: #64748b;">Payment Status</td>
                          <td style="padding: 10px 0 0 0; text-align: right;">
                              <span style="background-color: ${badgeBg}; color: ${badgeColor}; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; text-transform: capitalize; display: inline-block;">
                                  ${payment}
                              </span>
                          </td>
                      </tr>
                  </table>
              </div>

              <p style="font-size: 16px; line-height: 1.6; color: #475569;">If you need to make any changes or have special requests, please don't hesitate to reach out to our front desk.</p>
              
              <p style="font-size: 16px; margin-top: 35px; color: #334155;">Warm regards,<br><strong style="color: #0f172a;">Resort Management Team</strong></p>
          </div>

          <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 13px; color: #64748b;">
              © ${new Date().getFullYear()} Resort Management System. All rights reserved.
          </div>
      </div>
      `;

      
      await mailConfig(customer.email, subject, plainText, htmlContent);

      res.status(200).json({ status: "success" });

  } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ error: "An error occurred while creating the booking" });
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

      const customer = await Customer.findById(booking.customerID);
      const room = await Room.findById(booking.roomID);

      const checkoutTasks = [];

      checkoutTasks.push(
          Room.findByIdAndUpdate(booking.roomID, { $set: { isAvailable: true } })
      );

      checkoutTasks.push(
          Customer.findByIdAndUpdate(booking.customerID, { $unset: { roomID: "" } })
      );

      const currentCheckoutDate = new Date();
      const bookingUpdates = { checkOut: currentCheckoutDate }; 
      
      let finalPaymentStatus = booking.payment;
      if (req.body.payment === "paid") {
          bookingUpdates.payment = "paid";
          finalPaymentStatus = "paid";
      }

      checkoutTasks.push(
          Booking.findByIdAndUpdate(id, { $set: bookingUpdates })
      );

     
      await Promise.all(checkoutTasks);

      
      if (customer && customer.email) {
          const subject = 'Thank You For Your Stay! - Your Receipt';
          const formattedCheckIn = new Date(booking.checkIn).toDateString();
          const formattedCheckOut = currentCheckoutDate.toDateString();
          
          const badgeBg = finalPaymentStatus === 'paid' ? '#dcfce7' : '#fef3c7';
          const badgeColor = finalPaymentStatus === 'paid' ? '#166534' : '#92400e';

          const plainText = `Dear ${customer.name}, thank you for staying with us! Your final checkout for Room ${room?.roomID} is complete.`;

          const htmlContent = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #334155; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              
              <div style="background-color: #0f766e; padding: 30px 20px; text-align: center; color: #ffffff;">
                  <h1 style="margin: 0; font-size: 26px; font-weight: 600; letter-spacing: 0.5px;">Checkout Complete</h1>
                  <p style="margin: 10px 0 0 0; font-size: 15px; color: #ccfbf1;">We hope you enjoyed your stay!</p>
              </div>

              <div style="padding: 40px 30px; background-color: #ffffff;">
                  <p style="font-size: 16px; margin-top: 0;">Dear <strong>${customer.name}</strong>,</p>
                  <p style="font-size: 16px; line-height: 1.6; color: #475569;">Thank you for choosing our resort. You have successfully checked out. Below is your final receipt:</p>

                  <div style="background-color: #f8fafc; border-radius: 8px; padding: 25px; margin: 30px 0; border-left: 5px solid #0f766e;">
                      <table style="width: 100%; font-size: 15px; border-collapse: collapse;">
                          <tr>
                              <td style="padding: 10px 0; color: #64748b; border-bottom: 1px solid #e2e8f0;">Room</td>
                              <td style="padding: 10px 0; font-weight: 600; text-align: right; border-bottom: 1px solid #e2e8f0; color: #0f172a;">
                                  ${room?.roomID} <span style="font-size: 13px; color: #64748b; text-transform: capitalize; font-weight: normal;">(${room?.roomType})</span>
                              </td>
                          </tr>
                          <tr>
                              <td style="padding: 10px 0; color: #64748b; border-bottom: 1px solid #e2e8f0;">Check-In</td>
                              <td style="padding: 10px 0; font-weight: 600; text-align: right; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${formattedCheckIn}</td>
                          </tr>
                          <tr>
                              <td style="padding: 10px 0; color: #64748b; border-bottom: 1px solid #e2e8f0;">Check-Out</td>
                              <td style="padding: 10px 0; font-weight: 600; text-align: right; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${formattedCheckOut}</td>
                          </tr>
                          <tr>
                              <td style="padding: 15px 0 10px 0; color: #0f172a; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Total Amount</td>
                              <td style="padding: 15px 0 10px 0; font-weight: bold; font-size: 18px; text-align: right; border-bottom: 1px solid #e2e8f0; color: #0f766e;">
                                  $${room?.amount}
                              </td>
                          </tr>
                          <tr>
                              <td style="padding: 15px 0 0 0; color: #64748b;">Payment Status</td>
                              <td style="padding: 15px 0 0 0; text-align: right;">
                                  <span style="background-color: ${badgeBg}; color: ${badgeColor}; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; text-transform: capitalize; display: inline-block;">
                                      ${finalPaymentStatus}
                                  </span>
                              </td>
                          </tr>
                      </table>
                  </div>

                  <p style="font-size: 16px; line-height: 1.6; color: #475569;">We would love to welcome you back in the future. Have a safe journey home!</p>
                  
                  <p style="font-size: 16px; margin-top: 35px; color: #334155;">Warm regards,<br><strong style="color: #0f172a;">Resort Management Team</strong></p>
              </div>

              <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 13px; color: #64748b;">
                  © ${new Date().getFullYear()} Resort Management System. All rights reserved.
              </div>
          </div>
          `;

          await mailConfig(customer.email, subject, plainText, htmlContent);
      }

      res.status(200).json({ 
          status: "success", 
          message: "Checkout completed. Receipt sent and room is now available." 
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