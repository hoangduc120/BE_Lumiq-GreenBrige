const { VNPay } = require('vnpay');

const vnpay = new VNPay({
    tmnCode: 'B327N5YI',
    secureSecret: 'W0TQRIZJFDE9X6C4ZSVBKS7VOFIKFLSL',
    vnpayHost: ' https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    testMode: true,
    hashAlgorithm: 'SHA512',
    enableLog: true,
});

module.exports = { vnpay };