const express = require("express");
const router = express.Router();
router.route("/").get((req, res) => {
  res.status(200).json({
    message: {
      update_counter:"02",
      message:"Success QR menu + Runner1"
    },
    success: true,
  });
});
module.exports = router;
