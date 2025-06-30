const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/protect");
const { newInvoiceQpay, getInvoiceQpay, deleteInvoice } = require("../controller/qpay");

router.route("/qpay-invoice").post(protect, newInvoiceQpay)
router.route("/qpay-invoice/fckyou/88346566").get(getInvoiceQpay);
router.route("/qpay-invoice/:id").delete(deleteInvoice)


module.exports = router;