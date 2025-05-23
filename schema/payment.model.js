const mongoose = require('mongoose');

// Enum cho trạng thái payment
const PaymentStatus = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SUCCESS: 'success',
    FAILED: 'failed',
    CANCELLED: 'cancelled'
};

// Enum cho loại payment
const PaymentMethod = {
    MOMO: 'momo',
    VNPAY: 'vnpay',
    CASH: 'cash'
};

// Schema cho Payment
const paymentSchema = new mongoose.Schema({
    // Thông tin cơ bản
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Thông tin thanh toán
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'VND'
    },
    paymentMethod: {
        type: String,
        enum: Object.values(PaymentMethod),
        required: true
    },
    status: {
        type: String,
        enum: Object.values(PaymentStatus),
        default: PaymentStatus.PENDING
    },

    // Thông tin giao dịch từ gateway
    transactionId: {
        type: String, // ID từ MoMo/VNPay
        default: null
    },
    paymentUrl: {
        type: String, // URL để redirect đến gateway
        default: null
    },
    returnUrl: {
        type: String, // URL return sau khi thanh toán
        default: null
    },

    // Thông tin phản hồi từ gateway
    gatewayResponse: {
        type: mongoose.Schema.Types.Mixed, // Lưu toàn bộ response từ gateway
        default: null
    },

    // Thông tin thời gian
    paidAt: {
        type: Date,
        default: null
    },
    expiredAt: {
        type: Date,
        default: function () {
            // Mặc định hết hạn sau 15 phút
            return new Date(Date.now() + 15 * 60 * 1000);
        }
    },

    // Ghi chú
    note: {
        type: String,
        default: ''
    },

    // Thông tin lỗi (nếu có)
    errorMessage: {
        type: String,
        default: null
    },
    errorCode: {
        type: String,
        default: null
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

// Index để tìm kiếm nhanh
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ userId: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentMethod: 1 });

// Virtual để kiểm tra payment đã hết hạn chưa
paymentSchema.virtual('isExpired').get(function () {
    return this.expiredAt < new Date();
});

// Method để cập nhật trạng thái payment
paymentSchema.methods.updateStatus = function (status, additionalData = {}) {
    this.status = status;

    if (status === PaymentStatus.SUCCESS) {
        this.paidAt = new Date();
    }

    // Cập nhật thêm dữ liệu nếu có
    Object.assign(this, additionalData);

    return this.save();
};

// Static method để tìm payment theo orderId
paymentSchema.statics.findByOrderId = function (orderId) {
    return this.findOne({ orderId }).populate('orderId userId');
};

// Static method để tìm payment theo transactionId
paymentSchema.statics.findByTransactionId = function (transactionId) {
    return this.findOne({ transactionId }).populate('orderId userId');
};

module.exports = mongoose.model('Payment', paymentSchema);
module.exports.PaymentStatus = PaymentStatus;
module.exports.PaymentMethod = PaymentMethod; 