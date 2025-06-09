const transactionStatus = {
    PENDING: 'Pending',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
};

const paymentMethods = {
    VNPAY: 'VNPay',
    MOMO: 'Momo',
    VietQR: "vietqr"
};

module.exports = { transactionStatus, paymentMethods };
