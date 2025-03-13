const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/protect");
const { createMenuItem, getMenuItems, getMenuItem, deleteMenuItem, updateMenuItem } = require("../controller/menu_item");

router.route("/").post(protect, createMenuItem).get(getMenuItems);
router
  .route("/:id").get(getMenuItem).delete(protect, deleteMenuItem).put(protect,updateMenuItem);
module.exports = router;
