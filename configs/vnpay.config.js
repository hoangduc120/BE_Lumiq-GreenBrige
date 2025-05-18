const { VNPay } = require('vnpay');

const vnpay = new VNPay({
    tmnCode: process.env.VNPAY_TMN_CODE,
    secureSecret: process.env.VNPAY_SECURE_SECRET,
    vnpayHost: process.env.VNPAY_HOST,
    testMode: true,
    hashAlgorithm: 'SHA512',
    enableLog: true,
});

module.exports = { vnpay };