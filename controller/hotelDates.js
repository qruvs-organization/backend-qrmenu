const asyncHandler = require("../middleware/asyncHandle");
const menu_item = require("../models/menu_item");
const MyError = require("../utils/myError");
const _ = require("lodash");
const now = new Date();
exports.createHotelDates = asyncHandler(async (req, res, next) => {
  const { body } = req;
  const hotel_order_dates = await req.db.hotel_order_dates.create({
    ...body,
  });
  if (!hotel_order_dates) {
    throw new MyError("Нэмэх явцад алдаа гарлаа", 400);
  }

  res.status(200).json({
    message: "",
    body: { success: true },
  });
});
exports.removeHotelDates = asyncHandler(async (req, res, next) => {
  const { body } = req;
  const hotel_order_dates = await req.db.hotel_order_dates.findByPk(req.params.id);
  if (!hotel_order_dates) {
    throw new MyError("Мэдээлэл олдсонгүй алдаа гарлаа", 400);
  }
  await hotel_order_dates.destroy()

  res.status(200).json({
    message: "",
    body: { success: true },
  });
});