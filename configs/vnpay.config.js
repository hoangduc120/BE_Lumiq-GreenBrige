const { VNPay } = require('vnpay');

const vnpay = new VNPay({
    tmnCode: process.env.VNPAY_TMN_CODE,
    secureSecret: process.env.VNPAY_SECURE_SECRET,
    vnpayHost: process.env.VNPAY_HOST,
    testMode: true,
    hashAlgorithm: 'SHA512',
    enableLog: true,
});

// Các loại sản phẩm của VNPay
const ProductCode = {
    Topup: 'TOPUP',
    Billpayment: 'BILLPAYMENT',
    Fashion: 'FASHION',
    Other: 'other'
};

// Ngôn ngữ hiển thị
const VnpLocale = {
    VN: 'vn',
    EN: 'en'
};

module.exports = { vnpay, ProductCode, VnpLocale };