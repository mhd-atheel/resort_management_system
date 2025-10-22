
const { mailConfig } = require("./mailConfig");


const sendOtp = async (email, otp) => {

    const subject = 'Your OTP Code';
    const text = `Your OTP code is ${otp}`;

    await mailConfig(email, subject, text);

};

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit OTP
}

module.exports = { generateOTP, sendOtp }