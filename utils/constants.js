const DepartmentPayment = [{
    type: "min",
    max_limit_photo: 30
},
{
    type: "standart",
    max_limit_photo: 50
},
{
    type: "premium",
    max_limit_photo: 50
}]

const PaymentSell = [{
    process: 0,
    exp_day: 30
},{
    process: 5,
    exp_day: 180
},
{
    process: 10,
    exp_day: 365
}]

module.exports = {
  PaymentSell,DepartmentPayment
};