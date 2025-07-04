const asyncHandler = require("../middleware/asyncHandle");
const axios = require("axios");
const MyError = require("../utils/myError");
const base64 = require("buffer").Buffer;
const dotenv = require("dotenv");
const exp = require("constants");
const cuid = require("cuid");
const { generatePayment } = require("../utils/common");
const paginate = require("../utils/paginate-sequelize");
dotenv.config({ path: "./config/config.env" });
const username = process.env.QPAY_USERNAME;
const password = process.env.QPAY_PASSWORD;
const INVOICE_CODE = process.env.INVOICE_CODE;
const SENDER_INVOICE_NO = "1234657";
const SENDER_BRANCH_CODE = "SALBAR1";
const QPAY_CALL_BACK_URL = process.env.QPAY_CALL_BACK_URL;

const getToken = async (merchant_username = username, merchantpassword = password) => {
  const response = await axios.post(
    (process.env.QPAY_BASEURL || "https://merchant.qpay.mn") + "/auth/token",
    {},
    {
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " + base64.from(`${merchant_username}:${merchantpassword}`).toString("base64"),
      },
    }
  );
  if (!response) {
    throw new MyError(`Хүсэлт амжилтгүй ..`, 400);
  }
  return response.data.access_token;
};
exports.deleteInvoice = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const invoice = await req.db.invoice.findOne({
    where: {
      id,
    },
  });
  if (!invoice) {
    throw new MyError(
      `Таны устгах гэсэн ${id} дугаартай мэдээлэл олдсонгүй`,
      404
    );
  }
  await invoice.destroy();

  res.status(200).json({
    message: "Invoice Deleted",
    body: { success: true },
  });
});
// new invoice
exports.newInvoiceQpay = asyncHandler(async (req, res, next) => {
  const merchant = await req.db.merchant.findOne({
    where: {
      is_active: true
    }
  })
  const token = await (merchant ? getToken(merchant.username, merchant.password) : getToken());

  const { departmentId, exp_day, amount, pay_type = 'standart' } = req.body;
  const userId = req.userId;
  if (!departmentId || !exp_day || !userId || !amount) {
    throw new MyError("Мэдээлэлээ бүрэн дамжуулна уу", 400);
  }
  if (!token) {
    throw new MyError(`Токен байхгүй байна ..`, 400);
  }
  const uniq_generate_id = "department_" + departmentId + "_" + cuid()
  const callback_url = QPAY_CALL_BACK_URL + `?departmentId=${departmentId}&exp_day=${exp_day}&userId=${userId}&uniq_generate_id=${uniq_generate_id}&pay_type=${pay_type}`;
  const calculateAmount = generatePayment(exp_day, amount)
  const new_invoice = await axios.post(
    (process.env.QPAY_BASEURL || "https://merchant.qpay.mn") + "/invoice",
    {
      invoice_code: merchant.invoice_code || INVOICE_CODE,
      sender_invoice_no: SENDER_INVOICE_NO,
      invoice_receiver_code: "terminal",
      invoice_description: `Сунгалт: ${exp_day} өдөр, ${pay_type} багц`,
      sender_branch_code: SENDER_BRANCH_CODE,
      amount: calculateAmount.amount,
      callback_url,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    }
  );
  if (!new_invoice) {
    throw new MyError(`invoice үүссэнгүй байна ..`, 400);
  }
  const { qr_text, invoice_id } = new_invoice.data;

  const invoice_res = await req.db.invoice.create({
    bank_qr_code: qr_text,
    amount,
    sell: calculateAmount.sell,
    invoice_id,
    callback_url,
    payment_type: "QPAY",
    uniq_generate_id
  });
  if (!invoice_res) {
    throw new MyError(`invoice үүссэнгүй байна ..`, 400);
  }
  res.status(200).json({
    message: "QPAY.",
    body: new_invoice.data,
  });
});

exports.getInvoiceQpay = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 1000;
  const sort = req.query.sort;
  let select = req.query.select;
  if (select) {
    select = select.split(" ");
  }

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, req.db.invoice);

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
  const invoice = await req.db.invoice.findAll(query);
  res.status(200).json({
    success: true,
    items: invoice,
  });
})