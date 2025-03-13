const asyncHandler = require("../middleware/asyncHandle");
const MyError = require("../utils/myError");
const paginate = require("../utils/paginate-sequelize");
exports.createMenu = asyncHandler(async (req, res, next) => {
  const { body } = req;
  const menu = await req.db.menu.create({
      ...body
  })
  if (!menu) {
      throw new MyError("Нэмэх явцад алдаа гарлаа", 400);
    }
  
    res.status(200).json({
      message: "",
      body: { success: true },
    });
})
exports.getMenu=asyncHandler(async(req,res,next)=>{
    const {id}=req.params
    if(!id){
        throw new MyError("Мэдээлэл олдсонгүй", 400);
    }
    const menu=await req.db.menu.findByPk(id,{
      include:[{
        model:req.db.department
      },{
        model:req.db.category
      }]
    })
    res.status(200).json({
      message: "",
      body: menu,
    });
})
exports.getMenus=asyncHandler(async(req,res,next)=>{
  const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 1000;
   const sort = req.query.sort;
   let select = req.query.select;
 
   if (select) {
     select = select.split(" ");
   }
 
   ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);
 
   const pagination = await paginate(page, limit, req.db.menu);
 
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
 
   const menu = await req.db.menu.findAll(query);
   res.status(200).json({
     success: true,
     items: menu,
     pagination,
   });
})


exports.deleteMenu = asyncHandler(async (req, res, next) => {
  const {id} = req.params;
  const menu = await req.db.menu.findByPk(id);
  if (!menu) {
    throw new MyError(`Таны устгах гэсэн ${id} дугаартай мэдээлэл олдсонгүй`, 404)
  }
  await menu.destroy();

  res.status(200).json({
    message: "Menu Deleted",
    body: { success: true }
  });
});
exports.updateMenu = asyncHandler(async (req, res, next) => {
  const {id}=req.params
  const menu = await req.db.menu.update({...req.body}, {
    where: {
      id
    }
  })
  if (!menu) {
    throw new MyError("Мэдээллийг шинэчилэх явцад алдаа гарлаа", 401)
  }
  res.status(200).json({  
    message: "Success",
    body: { success: true }
  });
});