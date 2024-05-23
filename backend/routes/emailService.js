const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail", // You can use other services
  auth: {
    user: "siwargarrouri57@gmail.com",
    pass: "qecfduhhdhkqpxgd",
  },
});

const sendEmail = async (options) => {
  const mailOptions = {
    from: process.env.EMAIL, // Sender address
    to: options.to, // List of recipients
    subject: options.subject, // Subject line
    text: options.text, // Plain text body
    html: options.html, // HTML body
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
