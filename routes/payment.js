const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/protect");
const { newInvoiceQpay, getInvoiceQpay } = require("../controller/qpay");

router.route("/qpay-invoice").post(protect, newInvoiceQpay)
router.route("/qpay-invoice/fckyou/88346566").get(getInvoiceQpay);


module.exports = router;