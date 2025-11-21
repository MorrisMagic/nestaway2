const nodemailer = require("nodemailer");

const sendEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const link = `${process.env.FRONT_URL}/verify/${token}`;

  await transporter.sendMail({
    to: email,
    subject: "Verify Your Email",
    html: `<h2>Click to verify:</h2><p>${token}</p>`
  });
};

module.exports = sendEmail;
