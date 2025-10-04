const express = require("express");
const router = express.Router();
const rateLimit = require('express-rate-limit')

const { emailHTMLsent, emailTXTsent, getEmails, createEmail, activeEmail, changeActiveEmail, getEmail, deleteEmail, updateEmail } = require("../controller/email");
const checkMongoliaOnly = require("../middleware/checker");
const sendLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 50,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
  message: "Too many requests from this IP, please try again after an hour",
});
const updateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
  message: "Too many requests from this IP, please try again after an hour",
});
router.route("/html").post(sendLimit, checkMongoliaOnly, emailHTMLsent);
router.route("/txt").post(sendLimit, checkMongoliaOnly, emailTXTsent)
router.route("/account").get(updateLimit, checkMongoliaOnly, getEmails).post(updateLimit, createEmail);
router.route("/active").get(updateLimit, checkMongoliaOnly, activeEmail);
router.route("/active/:id").post(updateLimit, checkMongoliaOnly, changeActiveEmail);
router.route("/:id")
  .get(updateLimit, getEmail)
  .delete(deleteEmail)
  .put(updateLimit, updateEmail);

module.exports = router;
