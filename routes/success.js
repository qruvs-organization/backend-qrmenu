const express = require("express");
const router = express.Router();
router.route("/").get((req, res) => {
  res.status(200).json({
    message: {
      update_counter:"01",
      message:"Success QR menu"
    },
    success: true,
  });
});
module.exports = router;
