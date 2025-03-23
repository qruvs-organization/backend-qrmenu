const asyncHandler = require("../middleware/asyncHandle");
const MyError = require("../utils/myError");
const paginate = require("../utils/paginate-sequelize");

exports.createDepartment = asyncHandler(async (req, res, next) => {
    const { body, userId } = req;
    const department = await req.db.department.create({
        ...body, userId
    })
    if (!department) {
        throw new MyError("Нэмэх явцад алдаа гарлаа", 400);
      }
    
      res.status(200).json({
        message: "",
        body: { success: true },
      });
})

exports.getDepartment=asyncHandler(async(req,res,next)=>{
    const {id}=req.params
    console.log(id)
    if(!id){
        throw new MyError("Мэдээлэл олдсонгүй", 400);
    }
    const department=await req.db.department.findByPk(id, {
      include:{
        model:req.db.menu
      }
    })
    
    res.status(200).json({
      message: "",
      body: department,
    });
})

exports.getDepartments=asyncHandler(async(req,res,next)=>{
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
  
    const departments = await req.db.department.findAll(query);
    res.status(200).json({
      success: true,
      body:{items: departments,total:departments.length,
      pagination},
    });
})

exports.updateDepartment = asyncHandler(async (req, res, next) => {
  const {id}=req.params
  const {userId}=req
  const department = await req.db.department.update({...req.body}, {
    where: {
      id, userId
    }
  })
  if (!department) {
    throw new MyError("Мэдээллийг шинэчилэх явцад алдаа гарлаа", 401)
  }
  res.status(200).json({
    message: "Success",
    body: { success: true },
  });
});

exports.deleteDepartment = asyncHandler(async (req, res, next) => {
  const {id} = req.params;
  const {userId}=req
  const department = await req.db.department.findOne({where: {
    id, userId
  }});
  if (!department) {
    throw new MyError(`Таны устгах гэсэн ${id} дугаартай мэдээлэл олдсонгүй`, 404)
  }
  await department.destroy();

  res.status(200).json({
    message: "Department Deleted",
    body: { success: true },
  });
});