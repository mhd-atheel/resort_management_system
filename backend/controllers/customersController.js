const { generateOTP, sendOtp } = require("../utils/sendOtp");
const { mailConfig } = require("../utils/mailConfig");
const Customer = require("../models/customersModel");




const verifyCustomer = async (req, res) => {

    try {
        const { email } = req.body;

        const otp = generateOTP();
        const otpExpires = Date.now() + 300000;

        const customer = await Customer.findOne({ email });

        if (!customer) {
            const newCustomer = new Customer({
                email: email,
                otp: otp,
                otpExpires: otpExpires
            });

            await newCustomer.save();
        }


        await Customer.findOneAndUpdate(
            { email },
            {
                $set: { otp: otp, otpExpires: otpExpires },
            }
        );

        await sendOtp(email, otp);

        res.status(200).json({ status: "success" });


    } catch (error) {

        res.status(500).json({ error: "An error occurred" });

    }
}

const verifyCustomerOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;


        const existEmail = await Customer.findOne({ email });

        if (!existEmail) {
            return res.status(400).json({ message: "customer not found" });
        }


        if (existEmail.otp !== otp || existEmail.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        await Customer.findOneAndUpdate(
            { email },
            {
                $set: { isVerified: true },
                $unset: { otp: "", otpExpires: "" },
            }
        );

        res.status(200).json({ status: "success", existEmail });

    } catch (error) {
        res.status(500).json({ error: "An error occurred" });
    }
};



const checkExistingCustomer = async (req, res) => {

    try {
        const { email } = req.body;

        const existEmail = await Customer.findOne({ email });

        if (existEmail) {
            res.status(200).json({ status: "exist", existEmail });
            return;
        };

        res.status(200).json({ status: "new" });


    } catch (error) {

        res.status(500).json({ error: "An error occurred" });

    }
}


const createCustomer = async (req, res) => {

    try {
        const { name, email, phoneNumber, address, nic, roomID } = req.body;

        await Customer.findOneAndUpdate(
            { email },
            {
                $set:
                {
                    name: name,
                    nic: nic,
                    phoneNumber: phoneNumber,
                    address: address,
                    roomID: roomID,
                },
            }
        );

        res.status(200).json({ status: "success" });


    } catch (error) {

        res.status(500).json({ error: "An error occurred" });

    }
}


// const getAllCustomers = async (req, res) => {

//     try {
//         const customer = await Customer.find();

//         res.status(200).json(customer);

//     } catch (error) {
//         res.status(500).json({ error: "An error occurred" });
//     }

// }

const getAllCustomers = async (req, res) => {
    try {
      
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.max(1, parseInt(req.query.limit) || 10);
      const search = req.query.search || "";
      const skip = (page - 1) * limit;
  
      const matchStage = search
        ? {
            $or: [
              { name: { $regex: search, $options: "i" } },
              { email: { $regex: search, $options: "i" } },
              { nic: { $regex: search, $options: "i" } },
              { phoneNumber: { $regex: search, $options: "i" } },
            ],
          }
        : {};
  
      const result = await Customer.aggregate([
        { $match: matchStage },
        {
          $facet: {
            metadata: [{ $count: "total" }],
            data: [
              { $sort: { createdAt: -1 } },
              { $skip: skip },
              { $limit: limit },
              
              
              {
                $lookup: {
                  from: "rooms",
                  localField: "roomID",
                  foreignField: "_id",
                  as: "currentRoomDetails",
                },
              },
              {
                $unwind: {
                  path: "$currentRoomDetails",
                  preserveNullAndEmptyArrays: true, 
                },
              },
              {
                $lookup: {
                  from: "bookings",
                  let: { customerId: "$_id" },
                  pipeline: [
                    { $match: { $expr: { $eq: ["$customerID", "$$customerId"] } } },
                    {
                      $lookup: {
                        from: "rooms",
                        localField: "roomID",
                        foreignField: "_id",
                        as: "bookingRoomDetails",
                      },
                    },
                    {
                      $unwind: {
                        path: "$bookingRoomDetails",
                        preserveNullAndEmptyArrays: true,
                      },
                    },
                    { $sort: { checkIn: -1 } }
                  ],
                  as: "bookingHistory",
                },
              },
            ],
          },
        },
      ]);
  
      
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
      console.error("Aggregation Error:", error);
     
      res.status(500).json({ 
          message: "Error fetching data", 
          error: error.message,
          data: [],
          pagination: { total: 0, page: 1, limit: 10, totalPages: 0 }
      });
    }
  };


const getCustomersById = async (req, res) => {

    const { id } = req.params;

    try {
        const customer = await Customer.findById(id).exec();

        res.status(200).json(customer);

    } catch (error) {
        res.status(500).json({ error: "An error occurred" });
    }

}




module.exports = {
    verifyCustomer,
    checkExistingCustomer,
    createCustomer,
    verifyCustomerOTP,
    getAllCustomers,
    getCustomersById,
    
}