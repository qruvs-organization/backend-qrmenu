const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/protect");
const { newInvoiceQpay } = require("../controller/qpay");

router.route("/qpay-invoice").post(protect, newInvoiceQpay);
module.exports = router;