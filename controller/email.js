const asyncHandler = require("../middleware/asyncHandle");
const sendEmail = require("../utils/email");
const MyError = require("../utils/myError");

exports.emailHTMLsent = asyncHandler(async (req, res, next) => {
  const { html, title, email,from } = req.body
  if (!title || !html || !email || !from) {
    throw new MyError("Алдаа гарлаа", 400);
  }
  await sendEmail({
    subject: title,
    email,
    from,
    message: html,
    isHtml: true,
  });
  res.status(200).json({
    message: "Email HTML Sent",
    body: { success: true }
  });
});

exports.emailTXTsent = asyncHandler(async (req, res, next) => {
  const { text, title, email, from } = req.body
  if (!title || !text || !email || !from) {
    throw new MyError("Алдаа гарлаа", 400);
  }
  await sendEmail({
    subject: title,
    email,
    from,
    message: text,
    isHtml: false
  });
  res.status(200).json({
    message: "Email Text Sent",
    body: { success: true }
  });
});