const express = require("express");
const dotenv = require("dotenv");
var path = require("path");
const fileUpload = require("express-fileupload");
var rfs = require("rotating-file-stream");
const colors = require("colors");
const errorHandler = require("./middleware/error");
var morgan = require("morgan");
const logger = require("./middleware/logger");
// Router оруулж ирэх
const userRoutes = require("./routes/users");
const departmentRoutes = require("./routes/department");
const hotelRoutes = require("./routes/hotelRoutes");
const menuRoutes = require("./routes/menu")
const categoryRoutes = require("./routes/category")
const menuItemRoutes = require("./routes/menu_item")
const addOnsRoutes = require("./routes/add_ons")
const ItemVariantRoutes = require("./routes/item_variant")
const uploadRoutes = require("./routes/upload")
const paymentRoutes = require("./routes/payment")
const emailRoutes = require("./routes/email");
const successRoutes = require("./routes/success");
const injectDb = require("./middleware/injectDb");
const cors = require("cors");
// Аппын тохиргоог process.env рүү ачаалах
dotenv.config({ path: "./config/config.env" });

const db = require("./config/db-mysql");
const { expiredCheckDepartments } = require("./services/cronJobs");

const app = express();

// create a write stream (in append mode)
var accessLogStream = rfs.createStream("access.log", {
  interval: "1d", // rotate daily
  path: path.join(__dirname, "log"),
});

// Body parser
app.use(express.json());
app.use(fileUpload());
app.use(cors());
app.use(logger);
app.use(injectDb(db));
app.use(express.static("public"));
app.use(morgan("combined", { stream: accessLogStream }));
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/department", departmentRoutes);
app.use("/api/v1/hotel", hotelRoutes);
app.use("/api/v1/menu", menuRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/item", menuItemRoutes);
app.use("/api/v1/add-ons", addOnsRoutes);
app.use("/api/v1/payment",paymentRoutes );
app.use("/api/v1/variant", ItemVariantRoutes);
app.use("/api/v1/email", emailRoutes);
app.use("/api/v1", successRoutes);
app.use(errorHandler);
// user to departments - one to many
db.users.hasMany(db.department, { foreignkey: "user_id", onDelete: "CASCADE" });
db.department.belongsTo(db.users);

// departments to menu - one to many
db.department.hasMany(db.menu, { foreignkey: "department_id", onDelete: "CASCADE" });
db.menu.belongsTo(db.department);

// menu to category - one to many
db.menu.hasMany(db.category, { foreignkey: "menu_id", onDelete: "CASCADE" });
db.category.belongsTo(db.menu);

// category to menu_item - one to many
db.category.hasMany(db.menu_item, { foreignkey: "category_id", onDelete: "CASCADE" });
db.menu_item.belongsTo(db.category);

// menu_item to add_ons - one to many
db.menu_item.hasMany(db.add_ons, { foreignkey: "menu_item_id", onDelete: "CASCADE" });
db.add_ons.belongsTo(db.menu_item);

// menu_item to item_variant - one to many
db.menu_item.hasMany(db.item_variant, { foreignkey: "menu_item_id", onDelete: "CASCADE" });
db.item_variant.belongsTo(db.menu_item);

// menu_item to hotel_order_dates - one to many
db.item_variant.hasMany(db.hotel_order_dates, { foreignkey: "item_variant_id", onDelete: "CASCADE" });
db.hotel_order_dates.belongsTo(db.item_variant);

db.sequelize
  .sync()
  .then((result) => {
    console.log("sync hiigdlee...");
  })
  .catch((err) => console.log(err));


// Cron Jobs
setInterval(async () => {
  await expiredCheckDepartments({ db }, {}, () => {});
}, 60000); // 60 секунд тутамд ажиллана

const server = app.listen(
  process.env.PORT,
  console.log(`Express сэрвэр ${process.env.PORT} порт дээр аслаа... `.rainbow)
);

process.on("unhandledRejection", (err, promise) => {
  console.log(`Алдаа гарлаа : ${err.message}`.underline.red.bold);
  server.close(() => {
    process.exit(1);
  });
});
