const { VNPay } = require('vnpay');

// Lấy biến môi trường từ .env với giá trị mặc định nếu không tìm thấy
const tmnCode = process.env.VNPAY_TMN_CODE;
const hashSecret = process.env.VNPAY_SECURE_SECRET;
const vnpayHost = process.env.VNPAY_HOST


const vnpay = new VNPay({
    tmnCode: tmnCode,
    secureSecret: hashSecret, // Sử dụng biến đã kiểm tra ở trên
    vnpayHost: vnpayHost,
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

module.exports = { vnpay, ProductCode, VnpLocale, tmnCode, hashSecret, vnpayHost };