const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
// Debugging: Ensure environment variables are loaded
console.log("Email User:", process.env.EMAIL_USER ? "Loaded" : "Not Loaded");
console.log("Email Pass:", process.env.EMAIL_PASS ? "Loaded" : "Not Loaded");
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
