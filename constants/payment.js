// Trạng thái payment
const PaymentStatus = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SUCCESS: 'success',
    FAILED: 'failed',
    CANCELLED: 'cancelled'
};

// Phương thức thanh toán
const PaymentMethod = {
    MOMO: 'momo',
    VNPAY: 'vnpay',
    CASH: 'cash'
};

// Mã lỗi thanh toán
const PaymentErrorCode = {
    INVALID_AMOUNT: 'INVALID_AMOUNT',
    ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
    PAYMENT_EXPIRED: 'PAYMENT_EXPIRED',
    GATEWAY_ERROR: 'GATEWAY_ERROR',
    VERIFICATION_FAILED: 'VERIFICATION_FAILED',
    INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
    CANCELLED_BY_USER: 'CANCELLED_BY_USER'
};

// Thời gian hết hạn mặc định (phút)
const PaymentExpiryTime = {
    DEFAULT: 15, // 15 phút
    EXTENDED: 30, // 30 phút cho VIP
    SHORT: 5 // 5 phút cho test
};

module.exports = {
    PaymentStatus,
    PaymentMethod,
    PaymentErrorCode,
    PaymentExpiryTime
}; 