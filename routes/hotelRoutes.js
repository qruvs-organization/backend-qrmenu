const express = require("express");
const router = express.Router();
const { createHotelDates, removeHotelDates } = require("../controller/hotelDates");
const { protect } = require("../middleware/protect");
router.route("/dates").post(protect,createHotelDates)
router.route("/dates/:id").post(protect,removeHotelDates)
module.exports = router;
