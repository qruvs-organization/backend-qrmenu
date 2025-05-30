const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const isHtml = options.isHtml ?? true;
  let transporter = nodemailer.createTransport({
    service:"gmail",
    auth: {
      user: process.env.SMTP_USERNAME, // generated ethereal user
      pass: process.env.SMTP_PASSWORD, // generated ethereal password
    },
  });
  var mailOptions = {
    from: options.from?`${options.from} <${process.env.SMTP_USERNAME}>`: `Цахим меню систем <${process.env.SMTP_USERNAME}>`,
    to: options.email,
    subject: options.subject,
     ...(isHtml
      ? { html: options.message }
      : { text: options.message }),
  };

  const info = await transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });


  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

  return info;
};

module.exports = sendEmail;
