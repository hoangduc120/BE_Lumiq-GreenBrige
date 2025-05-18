const paymentService = require('../services/payment.service');

class PaymentController {
    async createMomoPayment(req, res) {
        try {
            const { amount, orderId } = req.body;

            if (!amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng cung cấp số tiền thanh toán'
                });
            }

            const response = await paymentService.createMomoPayment(amount, orderId);

            return res.status(200).json({
                success: true,
                data: response
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Đã xảy ra lỗi khi tạo thanh toán MoMo'
            });
        }
    }

    async momoCallback(req, res) {
        try {
            const requestData = req.body;

            // Xác thực thông tin giao dịch
            const isValid = await paymentService.verifyMomoPayment(requestData);

            if (!isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Xác thực thanh toán thất bại'
                });
            }

            // Cập nhật trạng thái đơn hàng trong database
            // Implement logic cập nhật đơn hàng sau

            return res.status(200).json({
                success: true,
                message: 'Thanh toán thành công'
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Đã xảy ra lỗi khi xử lý callback từ MoMo'
            });
        }
    }

    async verifyMomoPayment(req, res) {
        try {
            const { orderId, requestId } = req.body;

            if (!orderId || !requestId) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu thông tin xác thực giao dịch'
                });
            }

            // Kiểm tra trạng thái giao dịch từ MoMo
            const verifyResult = await paymentService.verifyMomoPaymentStatus(orderId, requestId);

            // Kiểm tra kết quả trả về từ MoMo
            if (verifyResult.resultCode !== 0) {
                return res.status(400).json({
                    success: false,
                    message: `Giao dịch không thành công. Mã lỗi: ${verifyResult.resultCode}`,
                    data: verifyResult
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Giao dịch thành công',
                data: verifyResult
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Đã xảy ra lỗi khi xác thực thanh toán MoMo'
            });
        }
    }
}

module.exports = new PaymentController();
