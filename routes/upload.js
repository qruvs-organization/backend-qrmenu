const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Upload хадгалах тохиргоо
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/"); // "uploads" хавтас дотор хадгална
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Файлын нэрийг timestamp-аар солих
    },
  });
  
  const upload = multer({ storage: storage });

router.post('/', upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Файл олдсонгүй." });
  }
  res.status(200).json({ success: true, photo: req.file.filename });
});

module.exports = router;
