const { Op } = require("sequelize");
const asyncHandler = require("../middleware/asyncHandle");
const MyError = require("../utils/myError");
const paginate = require("../utils/paginate-sequelize");
const { generateLengthDate } = require("../utils/common");
const now = new Date();
exports.createDepartment = asyncHandler(async (req, res, next) => {
  const { body, userId } = req;
  const department = await req.db.department.create({
    ...body,
    userId,
  });
  if (!department) {
    throw new MyError("Нэмэх явцад алдаа гарлаа", 400);
  }

  res.status(200).json({
    message: "",
    body: { success: true },
  });
});

exports.getDepartment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    throw new MyError("Мэдээлэл олдсонгүй", 400);
  }
  const department = await req.db.department.findByPk(id, {
    include: {
      model: req.db.menu,
    },
  });

  res.status(200).json({
    message: "",
    body: department,
  });
});

exports.getDepartments = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 1000;
  const sort = req.query.sort;
  let select = req.query.select;

  if (select) {
    select = select.split(" ");
  }

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, req.db.department);

  let query = { offset: pagination.start - 1, limit };
  if (req.query) {
    if (req.userId) {
      req.query = { ...req.query, userId: req.userId };
    } else {
      req.query = {
        ...req.query,
        expired_date: {
          [Op.gt]: now,
        },
      };
    }
    query.where = { ...req.query };
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

  const departments = await req.db.department.findAll(query);
  res.status(200).json({
    success: true,
    body: {
      items: departments,
      total: departments.length,
      pagination,
    },
  });
});

exports.updateDepartment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req;
  const department = await req.db.department.update(
    { ...req.body },
    {
      where: {
        id,
        userId,
      },
    }
  );
  if (!department) {
    throw new MyError("Мэдээллийг шинэчилэх явцад алдаа гарлаа", 401);
  }
  res.status(200).json({
    message: "Success",
    body: { success: true },
  });
});

exports.deleteDepartment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req;
  const department = await req.db.department.findOne({
    where: {
      id,
      userId,
    },
  });
  if (!department) {
    throw new MyError(
      `Таны устгах гэсэн ${id} дугаартай мэдээлэл олдсонгүй`,
      404
    );
  }
  await department.destroy();

  res.status(200).json({
    message: "Department Deleted",
    body: { success: true },
  });
});

exports.expiredCheckDepartments = asyncHandler(async (req, res, next) => {
  const now = new Date(); // Одоогийн цаг авах
  const findAll = await req.db.department.find(); // Бүх department авах

  for (const item of findAll) {
    if (new Date(item.expired_date) < now) {
      // Хугацаа дууссан эсэхийг шалгах
      await item.updateOne({ is_paid: false }); // Хэрэв дууссан бол төлөв шинэчлэх
    }
  }
});
// departmentId and expire day : http://localhost:8001/api/v1/department/qpay?departmentId=1&exp_day=2&order_number=3
exports.ExpiredTimeQpayCallback = asyncHandler(async (req, res, next) => {
  const { departmentId, exp_day, userId } = req.query;
  if (!departmentId || !exp_day || !userId) {
    throw new MyError("Мэдээлэлээ бүрэн дамжуулна уу", 400);
  }
 await req.db.department.update(
    { expired_date: generateLengthDate(parseInt(exp_day || 0)), ispaid:true },
    {
      where: {
        id: departmentId,
        userId,
      },
    }
  );
  res.status(201).json({
    success: true,
    message: `Таны бүтээгдэхүүний төлбөр амжилттай төлөгдлөө.`,
  });
});
