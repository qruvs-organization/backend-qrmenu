const express = require("express");
const dotenv = require("dotenv");
var path = require("path");
const fileUpload = require("express-fileupload");
var rfs = require("rotating-file-stream");
const colors = require("colors");
const errorHandler = require("./middleware/error");
var morgan = require("morgan");
const logger = require("./middleware/logger");
const fileupload = require("express-fileupload");
// Router оруулж ирэх
const userRoutes = require("./routes/users");
const uploadRoutes = require("./routes/upload")
const successRoutes = require("./routes/success");
const injectDb = require("./middleware/injectDb");
const cors = require("cors");
// Аппын тохиргоог process.env рүү ачаалах
dotenv.config({ path: "./config/config.env" });

const db = require("./config/db-mysql");

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
app.use("/api/v1", successRoutes);
app.use(errorHandler);
// relationships and hasOne,hasMany, belongsToMany, belongs

// // user to product - one to many
// db.users.hasMany(db.product, { foreignkey: "userId" });
// db.product.belongsTo(db.users);

// // order in order_items - one to many
// db.order.hasMany(db.order_item, { foreignkey: "orderId", onDelete: "CASCADE",
//   onUpdate: "CASCADE", });
// db.order_item.belongsTo(db.order);
// // order in order_items - one to many
// db.order.hasMany(db.invoice, {
//   foreignkey: "orderId", onDelete: "CASCADE",  // Ensures invoices are deleted when order is deleted
//   onUpdate: "CASCADE",
// });
db.sequelize
  .sync()
  .then((result) => {
    console.log("sync hiigdlee...");
  })
  .catch((err) => console.log(err));

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
