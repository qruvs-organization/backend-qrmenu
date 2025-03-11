const asyncHandler = require("../middleware/asyncHandle");
const axios = require("axios");
const MyError = require("../utils/myError");
const base64 = require("buffer").Buffer;
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const username = process.env.QPAY_USERNAME;
const password = process.env.QPAY_PASSWORD;
const INVOICE_CODE = process.env.INVOICE_CODE
const SENDER_INVOICE_NO = "1234657"
const SENDER_BRANCH_CODE = "SALBAR1"
const CALL_BACK_URL = process.env.CALL_BACK_URL

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
    const { order_number, order_id, amount } = req.body;
    if (!order_id || !order_number || !amount) {
        throw new MyError(`Захиалгын мэдээлэл дутуу байна ..`, 400);
    }
    if (!token) {
        throw new MyError(`Токен байхгүй байна ..`, 400);
    }
    const callback_url = CALL_BACK_URL + `?order_number=${order_number}&order_id=${order_id}`
    const new_invoice = await axios.post(
        (process.env.QPAY_BASEURL || "https://merchant.qpay.mn") + "/invoice",
        {
            invoice_code: INVOICE_CODE,
            sender_invoice_no: SENDER_INVOICE_NO,
            invoice_receiver_code: "terminal",
            invoice_description: req.body.description || "Барааны үнэ",
            sender_branch_code: SENDER_BRANCH_CODE,
            amount,
            callback_url
        },
        {
            headers: {
                "Content-Type": "application/json",
                Authorization:
                    "Bearer " + token,
            },
        }
    );
    const { qr_text, invoice_id } = new_invoice.data
    const existingInvoice = await req.db.invoice.findOne({ where: { orderId: order_id } });
    if (existingInvoice) {
        await existingInvoice.update({
            bank_qr_code: qr_text,
            amount,
            invoice_id,
            callback_url,
            payment_type: "QPAY",
        });
        console.log("✅ Invoice updated:");
    } else {
        const newInvoice = await req.db.invoice.create({
            bank_qr_code: qr_text,
            amount,
            invoice_id,
            callback_url,
            payment_type: "QPAY",
            orderId: order_id,
        });
        console.log("✅ New invoice created:");
    }
    res.status(200).json({
        message: "QPAY.",
        body: new_invoice.data,
    });
});
