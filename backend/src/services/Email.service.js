const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "asmait.0604@gmail.com", // Replace with your email provider (e.g., Outlook, Yahoo)
  auth: {
    user: process.env.EMAIL, // Your email address
    pass: process.env.EMAIL_PASSWORD, // Your email password or app-specific password
  },
});

// Function to send email
const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = { sendEmail };
