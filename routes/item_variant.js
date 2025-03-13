const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/protect");
const { createItemVariant, getItemVariant, getItemVariants, deleteItemVariant, updateItemVariant } = require("../controller/item_variant");

router.route("/").post(protect, createItemVariant).get(getItemVariants);
router
  .route("/:id").get(getItemVariant).delete(protect, deleteItemVariant).put(protect,updateItemVariant);
module.exports = router;
