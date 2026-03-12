const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { generateOTP, sendOtp } = require("../utils/sendOtp");
const { generatePassword } = require("../utils/pwgen");
const { mailConfig } = require("../utils/mailConfig");


const createUser = async (req, res) => {
  try {
    const { name, email, stfID,contact,workType,dateJoined,userType} = req.body;

    const existEmail = await User.findOne({ email });

    if (existEmail) {
      res.status(400).json({ message: "Email already exist" });
      return;
    }

    const tempPassword = generatePassword({
      length: 16,
      useSymbols: false,
      avoidSimilar: true,
      
    });


    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(tempPassword, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      stfID,contact,workType,dateJoined,userType
    });

    await newUser.save();

    const subject = 'User created successfully message';
    const text = `email : ${email} , password : ${tempPassword} We are warmly welcome our resort management system as a Receptionist`;

    await mailConfig(email, subject, text);


    res.status(200).json({ status: "success" });
  } catch (error) {

    res.status(500).json({ error: "An error occurred" });
  }
};


const loginUser = async (req, res) => {
  const fiveDaysInMilliseconds = 5 * 24 * 60 * 60 * 1000; // 5 days in milliseconds
  const expirationDate = new Date(Date.now() + fiveDaysInMilliseconds);

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    const isValidPassword = await bcrypt.compare(password, user.password);

    const otp = generateOTP();
    const otpExpires = Date.now() + 300000;

    if (!user) {
      return res.status(401).json({ error: "Email does not exist" });
    }
    else if (!isValidPassword) {
      return res.status(401).json({ error: "Incorrect Password" });
    }
    else {
      await User.findOneAndUpdate(
        { email },
        {
          $set: { otp: otp, otpExpires: otpExpires },
        }
      );
      await sendOtp(email, otp);
      res.status(200).json({ status: "success" });
    }

  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
}

const verifyUserOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;


    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }


    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    await User.findOneAndUpdate(
      { email },
      {
        $set: { isVerified: true },
        $unset: { otp: "", otpExpires: "" },
      }
    );

    const secretKey = process.env.JWT_SECRET_KEY;

    const token = jwt.sign(
      { sub: user._id.toString(), email: user.email },
      secretKey,
      { expiresIn: '1h' }
    );

    res.status(200).json({ status: "success", token: token, user });

  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};


const userMe = async (req, res) => {
  try {
    
    const { sub, email } = req.user;

    const user = await User.findById(sub);

    return res.status(200).json({
      message: "Token verified successfully",
      user,
    });


  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

const getAllUsers = async (req, res) => {
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
            { stfID: { $regex: search, $options: "i" } },
            { contact: { $regex: search, $options: "i" } },
            { userType: { $regex: search, $options: "i" } }, 
          ],
        }
      : {};

    const result = await User.aggregate([
      { $match: matchStage },

      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $sort: { createdAt: -1 } }, 
            { $skip: skip },
            { $limit: limit },
            
            { 
                $project: { 
                    password: 0 
                } 
            }
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
    console.error("Error in getAllUsers:", error);
    res.status(500).json({
      message: "Error fetching users",
      error: error.message,
      data: [],
      pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
    });
  }
};


const updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { name, email, stfID, contact, workType, dateJoined, userType } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use by another account" });
      }
    }

    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          ...(name && { name }),
          ...(email && { email }),
          ...(stfID && { stfID }),
          ...(contact && { contact }),
          ...(workType && { workType }),
          ...(dateJoined && { dateJoined }),
          ...(userType && { userType }),
        },
      },
      { new: true, runValidators: true } 
    ).select("-password -otp -otpExpires"); 

    res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "An error occurred while updating the user" });
  }
};

const deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;

    
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      status: "success",
      message: "User account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "An error occurred while deleting the user" });
  }
};


module.exports = {
  createUser,
  loginUser,
  verifyUserOTP,
  userMe,
  getAllUsers,
  updateUserById,
  deleteUserById
}