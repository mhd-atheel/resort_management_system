const Booking = require("../models/bookingModel");
const Room = require("../models/roomsModel");


const getDashboardStats = async (req, res) => {
  try {
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(todayStart.getDate() - 10);

    
    const [recentBookings, totalRoomsCount, todayBookingsCount, last10DaysData] = await Promise.all([
      
      
      Booking.find()
        .sort({ createdAt: -1 }) 
        .limit(3)
        .populate("customerID", "name email phoneNumber") 
        .populate("roomID", "roomID roomType amount") 
        .lean(), 

      
      Room.countDocuments(),

      
      Booking.countDocuments({
        createdAt: { $gte: todayStart, $lte: todayEnd }
      }),

      
      Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: tenDaysAgo, $lte: todayEnd }
          }
        },
        {
          
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            bookingsCount: { $sum: 1 },
            revenue: { 
               
                $sum: 1 
            }
          }
        },
        { $sort: { _id: 1 } } 
      ])
    ]);

    
    const todayAvailableRooms = Math.max(0, totalRoomsCount - todayBookingsCount);

    
    const formatted10Days = last10DaysData.map(day => ({
      date: day._id,
      bookings: day.bookingsCount,
      availableRooms: Math.max(0, totalRoomsCount - day.bookingsCount)
    }));

    
    res.status(200).json({
      
      recentBookings,

      
      todayStats: {
        date: todayStart.toISOString().split('T')[0],
        bookingsCount: todayBookingsCount,
        availableRooms: todayAvailableRooms,
        totalRooms: totalRoomsCount
      },

      
      last10DaysStats: formatted10Days
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Error fetching dashboard data", error: error.message });
  }
};


module.exports = { getDashboardStats };