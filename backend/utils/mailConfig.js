const nodemailer = require("nodemailer");


const mailConfig = async (email,subject,text) => {

    var transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465, // or 587 for TLS
          secure: true, // true for 465, false for 587
          auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
          },
     });

     await new Promise((resolve, reject) => {
        // verify connection configuration
        transporter.verify(function (error, success) {
            if (error) {
                console.log(error);
                reject(error);
            } else {
                console.log("Server is ready to take our messages");
                resolve(success);
            }
        });
    });

    var mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: subject,
        text: text,
      };
      
      await new Promise((resolve, reject) => {
        // send mail
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                console.log(info);
                resolve(info);
            }
        });
    });



}

module.exports = {mailConfig}