const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "c698c1cd72f0fa",
      pass: "d06513ebcb430a",
    },
  });

  await transport.sendMail({
    from: "Akash Taek <thvtaek@gmail.com>",
    to: options.email,
    text: options.message,
  });
};

module.exports = sendEmail;
