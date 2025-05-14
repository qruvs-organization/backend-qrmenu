const asyncHandler = require("../middleware/asyncHandle");
const MyError = require("../utils/myError");
const paginate = require("../utils/paginate-sequelize");
exports.createMenuItem = asyncHandler(async (req, res, next) => {
  const { body } = req;
  const menu_item = await req.db.menu_item.create({
      ...body
  })
  if (!menu_item) {
      throw new MyError("Нэмэх явцад алдаа гарлаа", 400);
    }
  
    res.status(200).json({
      message: "",
      body: menu_item,
    });
})
exports.getMenuItem=asyncHandler(async(req,res,next)=>{
    const {id}=req.params
    if(!id){
        throw new MyError("Мэдээлэл олдсонгүй", 400);
    }
    const menu_item=await req.db.menu_item.findByPk(id,{
      include:[{
        model:req.db.category
      },{
        model:req.db.add_ons
      },{
        model:req.db.item_variant,
        include: [
        {
          model: req.db.hotel_order_dates,
        }
      ]
      }]
    })
    res.status(200).json({
      message: "",
      body: menu_item,
    });
})
exports.getMenuItems=asyncHandler(async(req,res,next)=>{
  const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 1000;
   const sort = req.query.sort;
   let select = req.query.select;
 
   if (select) {
     select = select.split(" ");
   }
 
   ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);
 
   const pagination = await paginate(page, limit, req.db.menu_item);
 
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
 
   const menu_item = await req.db.menu_item.findAll({...query, include:{
    model:req.db.item_variant
  }});
   res.status(200).json({
     success: true,
     body: {
       items: menu_item, total: menu_item.length,
       pagination
     },
   });
})


exports.deleteMenuItem = asyncHandler(async (req, res, next) => {
  const {id} = req.params;
  const menu_item = await req.db.menu_item.findByPk(id);
  if (!menu_item) {
    throw new MyError(`Таны устгах гэсэн ${id} дугаартай мэдээлэл олдсонгүй`, 404)
  }
  await menu_item.destroy();

  res.status(200).json({
    message: "Menu Item Deleted",
    body: { success: true }
  });
});
exports.updateMenuItem = asyncHandler(async (req, res, next) => {
  const {id}=req.params
  const menu_item = await req.db.menu_item.update({...req.body}, {
    where: {
      id
    }
  })
  if (!menu_item) {
    throw new MyError("Мэдээллийг шинэчилэх явцад алдаа гарлаа", 401)
  }
  res.status(200).json({  
    message: "Success",
    body: { success: true }
  });
});