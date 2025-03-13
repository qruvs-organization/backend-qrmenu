const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/protect");
const { getAddOns, deleteAddOns, updateAddOns, createAddOns, getAddOnss } = require("../controller/add_ons");

router.route("/").post(protect, createAddOns).get(getAddOnss);
router
  .route("/:id").get(getAddOns).delete(protect, deleteAddOns).put(protect,updateAddOns);
module.exports = router;
