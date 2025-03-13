const asyncHandler = require("../middleware/asyncHandle");
const MyError = require("../utils/myError");
const paginate = require("../utils/paginate-sequelize");
exports.createCategory = asyncHandler(async (req, res, next) => {
  const { body } = req;
  const category = await req.db.category.create({
      ...body
  })
  if (!category) {
      throw new MyError("Нэмэх явцад алдаа гарлаа", 400);
    }
  
    res.status(200).json({
      message: "",
      body: { success: true },
    });
})
exports.getCategory=asyncHandler(async(req,res,next)=>{
    const {id}=req.params
    if(!id){
        throw new MyError("Мэдээлэл олдсонгүй", 400);
    }
    const category=await req.db.category.findByPk(id,{
      include:[{
        model:req.db.menu
      },{
        model:req.db.menu_item
      }]
    })
    res.status(200).json({
      message: "",
      body: category,
    });
})
exports.getCategories=asyncHandler(async(req,res,next)=>{
  const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 1000;
   const sort = req.query.sort;
   let select = req.query.select;
 
   if (select) {
     select = select.split(" ");
   }
 
   ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);
 
   const pagination = await paginate(page, limit, req.db.category);
 
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
 
   const category = await req.db.category.findAll(query);
   res.status(200).json({
     success: true,
     items: category,
     pagination,
   });
})


exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const {id} = req.params;
  const category = await req.db.category.findByPk(id);
  if (!category) {
    throw new MyError(`Таны устгах гэсэн ${id} дугаартай мэдээлэл олдсонгүй`, 404)
  }
  await category.destroy();

  res.status(200).json({
    message: "Category Deleted",
    body: { success: true }
  });
});
exports.updateCategory = asyncHandler(async (req, res, next) => {
  const {id}=req.params
  const category = await req.db.category.update({...req.body}, {
    where: {
      id
    }
  })
  if (!category) {
    throw new MyError("Мэдээллийг шинэчилэх явцад алдаа гарлаа", 401)
  }
  res.status(200).json({  
    message: "Success",
    body: { success: true }
  });
});