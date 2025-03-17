const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate-sequelize");
const MyError = require("../utils/myError");
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/email");
const { generateLengthPass } = require("../utils/common");
exports.getUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 1000;
  const sort = req.query.sort;
  let select = req.query.select;

  if (select) {
    select = select.split(" ");
  }

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, req.db.users);

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

  const users = await req.db.users.findAll(query);
  res.status(200).json({
    success: true,
    items: users,
    pagination,
  });
});

exports.signUp = asyncHandler(async (req, res, next) => {
  const user = await req.db.users.create({ ...req.body });
  if (!user) {
    throw new MyError("Бүртгэж чадсангүй");
  }
  const message = `<!DOCTYPE html>
<html lang="mn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Цахим Меню Бүртгэл</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f9fafb;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 2px solid #28a745;
        }
        .header h1 {
            color: #28a745;
        }
        .content {
            padding: 20px 0;
        }
        .content p {
            font-size: 16px;
            line-height: 1.6;
        }
        .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 0.9em;
            color: #666;
        }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            color: #fff;
            background-color: #28a745;
            text-decoration: none;
            border-radius: 5px;
        }
        .btn:hover {
            background-color: #218838;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Сайн байна уу?</h1>
        </div>
        <div class="content">
            <p>Та <strong>"Цахим меню захиалга систем"</strong>-д амжилттай бүртгүүллээ. 🎉</p>
            <p><strong>Холбоос:</strong> <a href="https://qr-menu.itwork.mn">qr-menu.itwork.mn</a></p>
            <p>Өдрийг сайхан өнгөрүүлээрэй! ☀️</p>
        </div>
        <div class="footer">
            <p><a href="https://qr-menu.itwork.mn">qr-menu.itwork.mn</a> &copy; ${new Date().getFullYear()} БҮХ ЭРХ ХУУЛИАР ХАМГААЛАГДСАН.</p>
        </div>
    </div>
</body>
</html>
`;
  await sendEmail({
    subject: "Шинэ бүртгэл үүслээ",
    email: req.body.email,
    message,
  });
  res.status(200).json({
    message: "",
    body: { token: user.getJsonWebToken(), user: user },
  });
});

exports.signIn = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new MyError("Имейл эсвэл нууц үгээ оруулна уу", 400);
  }
  const user = await req.db.users.findOne({
    where: { email },
  });
  if (!user) {
    throw new MyError("Таны нэвтрэх нэр эсхүл нууц үг буруу байна", 400);
  }

  const ok = await user.CheckPass(password);
  if (!ok) {
    throw new MyError("Таны нэвтрэх нэр эсхүл нууц үг буруу байна", 400);
  }
  res.status(200).json({
    message: "",
    body: { token: user.getJsonWebToken(), user: user },
  });
});

exports.userInfo = asyncHandler(async (req, res, next) => {
  const { userId } = req;

  const user = await req.db.users.findOne({
    where: {
      id: userId
    }
  })
  if (!user) {
    throw new MyError("Та бүртгэлтэй эсэхээ шалгана уу", 401)
  }
  res.status(200).json({
    message: "Success (:",
    body: user,
  });
});
exports.updateUserInfo = asyncHandler(async (req, res, next) => {
  const { userId } = req;
  if (req.body.password) {
    delete req.body.password;
  }
  await req.db.users.update(
    req.body,
    { where: { id: userId }, fields: { exclude: ['password'] } }
  );
  res.status(200).json({
    message: "User updated.",
    body: { success: true },
  });
})
exports.removeUser = asyncHandler(async (req, res, next) => {
  const userId = req.params.id;
  const user = await req.db.users.findByPk(userId);
  if (!user) {
    throw new MyError(`Таны устгах гэсэн ${userId} дугаартай хэрэглэгчийн мэдээлэл олдсонгүй`, 404)
  }
  await user.destroy();

  res.status(200).json({
    message: "User Deleted",
    body: { success: true },
  });
});

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const password = generateLengthPass(8)
  if (!email) {
    throw new MyError(`Бүртгэлгүй байна!`, 400);
  }
  const users = await req.db.users.findOne({
    where: {
      email,
    },
  });
  if (!users) {
    throw new MyError( `${email} хэрэглэгч олдсонгүй!`, 400);
  }
  const salt = await bcrypt.genSalt(10);
  const new_password = await bcrypt.hash(password, salt);
  const message = `<!DOCTYPE html>
  <html lang="mn">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Цахим Меню Бүртгэл</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f9fafb;
              margin: 0;
              padding: 20px;
          }
          .container {
              max-width: 800px;
              margin: auto;
              background: #ffffff;
              padding: 20px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          .header {
              text-align: center;
              padding-bottom: 20px;
              border-bottom: 2px solid #28a745;
          }
          .header h1 {
              color: #28a745;
          }
          .content {
              padding: 20px 0;
          }
          .content p {
              font-size: 16px;
              line-height: 1.6;
          }
          .footer {
              margin-top: 20px;
              text-align: center;
              font-size: 0.9em;
              color: #666;
          }
          .btn {
              display: inline-block;
              padding: 10px 20px;
              color: #fff;
              background-color: #28a745;
              text-decoration: none;
              border-radius: 5px;
          }
          .btn:hover {
              background-color: #218838;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>Сайн байна уу? Таны нууц үгийг сэргээлээ та нэвтэрч ороод нууц үгээ солино уу.</h1>
          </div>
          <div class="content">
              <p>Та <strong>"Таны нууц үгээ сэргээлээ. 🎉</p>
              <p><strong>Холбоос:</strong> <a href="https://qr-menu.itwork.mn">qr-menu.itwork.mn</a></p>
              <p><strong>Нууц үг:</strong> ${password}</p>
              <p>Өдрийг сайхан өнгөрүүлээрэй! ☀️</p>
          </div>
          <div class="footer">
              <p><a href="https://qr-menu.itwork.mn">qr-menu.itwork.mn</a> &copy; ${new Date().getFullYear()} БҮХ ЭРХ ХУУЛИАР ХАМГААЛАГДСАН.</p>
          </div>
      </div>
  </body>
  </html>
  `;
    await sendEmail({
      subject: "Нууц үг солигдлоо үүслээ",
      email: req.body.email,
      message,
    });
  await req.db.users.update(
    { password: new_password },
    {
      where: {
        email,
      },
    }
  );
  res.status(200).json({
    message: "Таны нууц үг амжилттай сэргээгдлээ. Та бүртгэлтэй имейл хаягаараа нууц үгээ авна уу.",
    body: { success: true },
  });
});

exports.changePassword = asyncHandler(async (req, res, next) => {
  const id = req.userId;
  if (!id) {
    throw new MyError("Id олдсонгүй!", 400);
  }
  const new_password = req.body.password;
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(new_password, salt);
  await req.db.users.update(
    { password },
    {
      where: {
        id,
      },
    }
  );
  const message = `<!DOCTYPE html>
  <html lang="mn">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Цахим Меню Бүртгэл</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f9fafb;
              margin: 0;
              padding: 20px;
          }
          .container {
              max-width: 800px;
              margin: auto;
              background: #ffffff;
              padding: 20px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          .header {
              text-align: center;
              padding-bottom: 20px;
              border-bottom: 2px solid #28a745;
          }
          .header h1 {
              color: #28a745;
          }
          .content {
              padding: 20px 0;
          }
          .content p {
              font-size: 16px;
              line-height: 1.6;
          }
          .footer {
              margin-top: 20px;
              text-align: center;
              font-size: 0.9em;
              color: #666;
          }
          .btn {
              display: inline-block;
              padding: 10px 20px;
              color: #fff;
              background-color: #28a745;
              text-decoration: none;
              border-radius: 5px;
          }
          .btn:hover {
              background-color: #218838;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>Сайн байна уу?</h1>
          </div>
          <div class="content">
              <p>Та <strong>"Таны нууц үгээ шинэчлэгдлээ. 🎉</p>
              <p><strong>Холбоос:</strong> <a href="https://qr-menu.itwork.mn">qr-menu.itwork.mn</a></p>
              <p>Өдрийг сайхан өнгөрүүлээрэй! ☀️</p>
          </div>
          <div class="footer">
              <p><a href="https://qr-menu.itwork.mn">qr-menu.itwork.mn</a> &copy; ${new Date().getFullYear()} БҮХ ЭРХ ХУУЛИАР ХАМГААЛАГДСАН.</p>
          </div>
      </div>
  </body>
  </html>
  `;
    await sendEmail({
      subject: "Таны нууц үг амжилттай шинэчлэгдлээ",
      email: req.email,
      message,
    });
  res.status(200).json({
    message: "Таны нууц үг амжилттай шинэчлэгдлээ",
    body: { success: true },
  });
});