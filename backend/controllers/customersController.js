const { generateOTP, sendOtp } = require("../utils/sendOtp");
const { mailConfig } = require("../utils/mailConfig");
const Customer = require("../models/customersModel");




const verifyCustomer = async (req, res) => {

    try {
        const { email } = req.body;

        const otp = generateOTP();
        const otpExpires = Date.now() + 300000;


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
  
  
      const customer = await Customer.findOne({ email });

      if (!customer) {
        return res.status(400).json({ message: "customer not found" });
      }
  
  
      if (customer.otp !== otp || customer.otpExpires < Date.now()) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }
  
      await Customer.findOneAndUpdate(
        { email },
        {
          $set: { isVerified: true },
          $unset: { otp: "", otpExpires: "" },
        }
      );
  
      res.status(200).json({ status: "success"});
  
    } catch (error) {
      res.status(500).json({ error: "An error occurred" });
    }
  };



const checkExistingCustomer = async (req, res) => {

    try {
        const { email } = req.body;

        const existEmail = await Customer.findOne({ email });

        if (existEmail) {
            res.status(200).json({ status: "exist",existEmail});
            return;
        };

        res.status(200).json({ status: "new" });


    } catch (error) {

        res.status(500).json({ error: "An error occurred" });

    }
}


const createCustomer = async (req, res) => {

    try {
        const { name,email,phoneNumber,address } = req.body;

        const newCustomer = new Customer({
            name,
            email,
            phoneNumber,
            address
          });

        await newCustomer.save();
      
        res.status(200).json({ status: "success" });


    } catch (error) {

        res.status(500).json({ error: "An error occurred" });

    }
}


const getAllCustomers = async(req,res)=>{

    try {
        const customer = await Customer.find();
        
        res.status(200).json(customer);

    } catch (error) {
        res.status(500).json({ error: "An error occurred" });
    }

}


const getCustomersById = async(req,res)=>{

    const {id} = req.params;

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
    getCustomersById
}