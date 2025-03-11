const path = require("path");
const asyncHandler = require("../middleware/asyncHandle");
const MyError = require("../utils/myError");


exports.uploadImage = asyncHandler(async (req, res, next) => {
  const file = req.files.file;
  if (!file.mimetype.startsWith("image")) {
    throw new MyError(`Та зураг оруулна уу ..`, 400);
  }
  if (file.size > process.env.MAX_UPLOAD_FILE_SIZE) {
    throw new MyError(`Таны зурагны хэмжээ 20mb хэтэрч болохгүй ..`, 400);
  }
  file.name = `photo_${req.body.type}_${req.params.id}` + path.parse(file.name).ext;
  file.mv(`${process.env.PHOTO_FOLDER_PATH}/${file.name}`, (err) => {
    if (err) {
      throw new MyError(`оруулах явцад алдаа гарлаа ..`, 400);
    }
  });
  return res.status(200).json({
    success: true,
    body:{photo: file.name,}
  });
});
