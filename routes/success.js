const express = require("express");
const router = express.Router();
router.route("/").get((req, res) => {
  res.status(200).json({
    message: {
      message: "QR-MENU-API is working fine",
      version: "1.0.0",
      description: "Checker Mongolia Backend API",
    },
    success: true,
  });
});
module.exports = router;
