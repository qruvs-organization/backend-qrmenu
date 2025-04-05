const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/protect");
const {
  createDepartment,
  getDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
} = require("../controller/department");

router.route("/").post(protect, createDepartment).get(getDepartments);
router.route("/auth").get(protect,getDepartments);
router
  .route("/:id")
  .get(getDepartment)
  .put(protect, updateDepartment)
  .delete(protect, deleteDepartment);
module.exports = router;
