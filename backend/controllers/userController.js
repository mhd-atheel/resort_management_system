const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { generateOTP, sendOtp } = require("../utils/sendOtp");
const { generatePassword } = require("../utils/pwgen");
const { mailConfig } = require("../utils/mailConfig");


const createUser = async (req, res) => {
  try {
    const { name, email } = req.body;

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





module.exports = {
  createUser,
  loginUser,
  verifyUserOTP
}