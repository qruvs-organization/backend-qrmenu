const asyncHandler = require("../middleware/asyncHandle");
const axios = require("axios");
const MyError = require("../utils/myError");
const base64 = require("buffer").Buffer;
const dotenv = require("dotenv");
const exp = require("constants");
const cuid = require("cuid");
const { generatePayment } = require("../utils/common");
dotenv.config({ path: "./config/config.env" });
const username = process.env.QPAY_USERNAME;
const password = process.env.QPAY_PASSWORD;
const INVOICE_CODE = process.env.INVOICE_CODE;
const SENDER_INVOICE_NO = "1234657";
const SENDER_BRANCH_CODE = "SALBAR1";
const QPAY_CALL_BACK_URL = process.env.QPAY_CALL_BACK_URL;

const getToken = async () => {
  const response = await axios.post(
    (process.env.QPAY_BASEURL || "https://merchant.qpay.mn") + "/auth/token",
    {},
    {
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " + base64.from(`${username}:${password}`).toString("base64"),
      },
    }
  );
  if (!response) {
    throw new MyError(`Хүсэлт амжилтгүй ..`, 400);
  }
  return response.data.access_token;
};

// new invoice
exports.newInvoiceQpay = asyncHandler(async (req, res, next) => {
  const token = await getToken();
  const { departmentId, exp_day, amount, type='standart' } = req.body;
  const userId = req.userId;
  if (!departmentId || !exp_day || !userId || !amount) {
    throw new MyError("Мэдээлэлээ бүрэн дамжуулна уу", 400);
  }
  if (!token) {
    throw new MyError(`Токен байхгүй байна ..`, 400);
  }
  const uniq_generate_id="department_"+departmentId+"_"+cuid()
  const callback_url = QPAY_CALL_BACK_URL +`?departmentId=${departmentId}&exp_day=${exp_day}&userId=${userId}&uniq_generate_id=${uniq_generate_id}&type=${type}`;
  // const callback_url = "https://webhook-test.com/f5ff1a6564fda51d6d89a88912c5c5f9"
  
  const calculateAmount = generatePayment(exp_day, amount)
  const new_invoice = await axios.post(
    (process.env.QPAY_BASEURL || "https://merchant.qpay.mn") + "/invoice",
    {
      invoice_code: INVOICE_CODE,
      sender_invoice_no: SENDER_INVOICE_NO,
      invoice_receiver_code: "terminal",
      invoice_description: `Сунгалт: ${exp_day} өдөр, ${type} багц`,
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

 const invoice_res =  await req.db.invoice.create({
    bank_qr_code: qr_text,
    amount,
    sell:calculateAmount.sell,
    invoice_id,
    callback_url,
    payment_type: "QPAY",
    uniq_generate_id
  });
  if(!invoice_res){
    throw new MyError(`invoice үүссэнгүй байна ..`, 400);
  }
  res.status(200).json({
    message: "QPAY.",
    body: new_invoice.data,
  });
});
