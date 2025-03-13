const asyncHandler = require("../middleware/asyncHandle");
const MyError = require("../utils/myError");
const paginate = require("../utils/paginate-sequelize");
exports.createAddOns = asyncHandler(async (req, res, next) => {
  const { body } = req;
  const add_ons = await req.db.add_ons.create({
      ...body
  })
  if (!add_ons) {
      throw new MyError("Нэмэх явцад алдаа гарлаа", 400);
    }
  
    res.status(200).json({
      message: "",
      body: { success: true },
    });
})
exports.getAddOns=asyncHandler(async(req,res,next)=>{
    const {id}=req.params
    if(!id){
        throw new MyError("Мэдээлэл олдсонгүй", 400);
    }
    const add_ons=await req.db.add_ons.findByPk(id,{
      include:{
        model:req.db.menu_item
      }
    })
    res.status(200).json({
      message: "",
      body: add_ons,
    });
})
exports.getAddOnss=asyncHandler(async(req,res,next)=>{
  const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 1000;
   const sort = req.query.sort;
   let select = req.query.select;
 
   if (select) {
     select = select.split(" ");
   }
 
   ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);
 
   const pagination = await paginate(page, limit, req.db.add_ons);
 
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
 
   const add_ons = await req.db.add_ons.findAll(query);
   res.status(200).json({
     success: true,
     items: add_ons,
     pagination,
   });
})


exports.deleteAddOns = asyncHandler(async (req, res, next) => {
  const {id} = req.params;
  const add_ons = await req.db.add_ons.findByPk(id);
  if (!add_ons) {
    throw new MyError(`Таны устгах гэсэн ${id} дугаартай мэдээлэл олдсонгүй`, 404)
  }
  await add_ons.destroy();

  res.status(200).json({
    message: "Menu Item Deleted",
    body: { success: true }
  });
});
exports.updateAddOns = asyncHandler(async (req, res, next) => {
  const {id}=req.params
  const add_ons = await req.db.add_ons.update({...req.body}, {
    where: {
      id
    }
  })
  if (!add_ons) {
    throw new MyError("Мэдээллийг шинэчилэх явцад алдаа гарлаа", 401)
  }
  res.status(200).json({  
    message: "Success",
    body: { success: true }
  });
});