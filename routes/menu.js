const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/protect");
const { getMenu, createMenu, getMenus, deleteMenu, updateMenu } = require("../controller/menu");

router.route("/").post(protect, createMenu).get(getMenus);
router
  .route("/:id").get(getMenu).delete(protect, deleteMenu).put(protect,updateMenu);
module.exports = router;
