const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/protect");
const { createCategory, getCategories, getCategory, deleteCategory, updateCategory } = require("../controller/category");

router.route("/").post(protect, createCategory).get(getCategories);
router
  .route("/:id").get(getCategory).delete(protect, deleteCategory).put(protect,updateCategory);
module.exports = router;
