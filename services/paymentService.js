const Payment = require('../schema/payment.model');
const { PaymentStatus, PaymentMethod } = require('../schema/payment.model');

class PaymentService {

    async createPayment(paymentData) {
        try {
            const payment = new Payment(paymentData);
            await payment.save();
            return payment;
        } catch (error) {
            throw new Error(`Lỗi tạo payment: ${error.message}`);
        }
    }

    async getPaymentById(paymentId) {
        try {
            return await Payment.findById(paymentId).populate('orderId userId');
        } catch (error) {
            throw new Error(`Lỗi tìm payment: ${error.message}`);
        }
    }
    async getPaymentByOrderId(orderId) {
        try {
            return await Payment.findByOrderId(orderId);
        } catch (error) {
            throw new Error(`Lỗi tìm payment theo orderId: ${error.message}`);
        }
    }

    async getPaymentByTransactionId(transactionId) {
        try {
            return await Payment.findByTransactionId(transactionId);
        } catch (error) {
            throw new Error(`Lỗi tìm payment theo transactionId: ${error.message}`);
        }
    }

    async updatePaymentUrl(paymentId, paymentUrl, transactionId) {
        try {
            const payment = await Payment.findById(paymentId);
            if (!payment) {
                throw new Error('Không tìm thấy payment');
            }

            payment.paymentUrl = paymentUrl;
            payment.transactionId = transactionId;
            payment.status = PaymentStatus.PROCESSING;

            await payment.save();
            return payment;
        } catch (error) {
            throw new Error(`Lỗi cập nhật payment URL: ${error.message}`);
        }
    }

    async markPaymentSuccess(paymentId, gatewayResponse = {}) {
        try {
            const payment = await Payment.findById(paymentId);
            if (!payment) {
                throw new Error('Không tìm thấy payment');
            }

            return await payment.updateStatus(PaymentStatus.SUCCESS, {
                gatewayResponse,
                paidAt: new Date()
            });
        } catch (error) {
            throw new Error(`Lỗi cập nhật payment thành công: ${error.message}`);
        }
    }

    async markPaymentFailed(paymentId, errorMessage, errorCode = null) {
        try {
            const payment = await Payment.findById(paymentId);
            if (!payment) {
                throw new Error('Không tìm thấy payment');
            }

            return await payment.updateStatus(PaymentStatus.FAILED, {
                errorMessage,
                errorCode
            });
        } catch (error) {
            throw new Error(`Lỗi cập nhật payment thất bại: ${error.message}`);
        }
    }

    async cancelPayment(paymentId) {
        try {
            const payment = await Payment.findById(paymentId);
            if (!payment) {
                throw new Error('Không tìm thấy payment');
            }

            return await payment.updateStatus(PaymentStatus.CANCELLED);
        } catch (error) {
            throw new Error(`Lỗi hủy payment: ${error.message}`);
        }
    }

    async getPaymentsByUserId(userId, options = {}) {
        try {
            const { limit = 10, skip = 0, sort = { createdAt: -1 } } = options;

            return await Payment.find({ userId })
                .populate('orderId')
                .sort(sort)
                .limit(limit)
                .skip(skip);
        } catch (error) {
            throw new Error(`Lỗi lấy danh sách payment: ${error.message}`);
        }
    }
    async getPaymentStatistics(startDate, endDate) {
        try {
            const matchStage = {};
            if (startDate || endDate) {
                matchStage.createdAt = {};
                if (startDate) matchStage.createdAt.$gte = startDate;
                if (endDate) matchStage.createdAt.$lte = endDate;
            }

            const stats = await Payment.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$amount' }
                    }
                },
                {
                    $group: {
                        _id: null,
                        statusStats: {
                            $push: {
                                status: '$_id',
                                count: '$count',
                                totalAmount: '$totalAmount'
                            }
                        },
                        totalTransactions: { $sum: '$count' },
                        totalAmount: { $sum: '$totalAmount' }
                    }
                }
            ]);

            return stats[0] || { statusStats: [], totalTransactions: 0, totalAmount: 0 };
        } catch (error) {
            throw new Error(`Lỗi thống kê payment: ${error.message}`);
        }
    }

    async processExpiredPayments() {
        try {
            const expiredPayments = await Payment.find({
                status: PaymentStatus.PENDING,
                expiredAt: { $lt: new Date() }
            });

            let processedCount = 0;
            for (const payment of expiredPayments) {
                await payment.updateStatus(PaymentStatus.CANCELLED, {
                    errorMessage: 'Payment đã hết hạn'
                });
                processedCount++;
            }

            return processedCount;
        } catch (error) {
            throw new Error(`Lỗi xử lý payment hết hạn: ${error.message}`);
        }
    }
}

module.exports = new PaymentService(); 