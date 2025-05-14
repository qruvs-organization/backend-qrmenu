const asyncHandler = require("../middleware/asyncHandle");
const MyError = require("../utils/myError");
const paginate = require("../utils/paginate-sequelize");
exports.createItemVariant = asyncHandler(async (req, res, next) => {
  const { body } = req;
  const item_variant = await req.db.item_variant.create({
    ...body
  })
  if (!item_variant) {
    throw new MyError("Нэмэх явцад алдаа гарлаа", 400);
  }

  res.status(200).json({
    message: "",
    body: { success: true },
  });
})
exports.getItemVariant = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  if (!id) {
    throw new MyError("Мэдээлэл олдсонгүй", 400);
  }
  const item_variant = await req.db.item_variant.findByPk(id, {
    include: [{
      model: req.db.menu_item
    }, {
      model: req.db.hotel_order_dates
    }]
  })
  res.status(200).json({
    message: "",
    body: item_variant,
  });
})
exports.getItemVariants = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 1000;
  const sort = req.query.sort;
  let select = req.query.select;

  if (select) {
    select = select.split(" ");
  }

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, req.db.item_variant);

  let query = { offset: pagination.start - 1, limit };

  if (req.query) {
    query.where = req.query;
  }

  if (select) {
    query.attributes = select;
  }

  if (sort) {
    query.order = sort
      .split(" ")
      .map((el) => [
        el.charAt(0) === "-" ? el.substring(1) : el,
        el.charAt(0) === "-" ? "DESC" : "ASC",
      ]);
  }

  const item_variant = await req.db.item_variant.findAll(query);
  res.status(200).json({
    success: true,
    items: item_variant,
    pagination,
  });
})


exports.deleteItemVariant = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const item_variant = await req.db.item_variant.findByPk(id);
  if (!item_variant) {
    throw new MyError(`Таны устгах гэсэн ${id} дугаартай мэдээлэл олдсонгүй`, 404)
  }
  await item_variant.destroy();

  res.status(200).json({
    message: "Menu Item Variant Deleted",
    body: { success: true }
  });
});
exports.updateItemVariant = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  const item_variant = await req.db.item_variant.update({ ...req.body }, {
    where: {
      id
    }
  })
  if (!item_variant) {
    throw new MyError("Мэдээллийг шинэчилэх явцад алдаа гарлаа", 401)
  }
  res.status(200).json({
    message: "Success",
    body: { success: true }
  });
});