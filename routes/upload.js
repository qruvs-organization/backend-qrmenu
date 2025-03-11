const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/protect");
const { uploadImage } = require("../controller/upload");

router.route("/:id").post(protect, uploadImage)
module.exports = router;
