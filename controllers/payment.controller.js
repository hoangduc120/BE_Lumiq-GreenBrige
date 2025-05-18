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

    // Phương thức tạo thanh toán VNPay
    async createVnPayPayment(req, res) {
        try {
            const { amount, orderId, items } = req.body;

            if (!amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng cung cấp số tiền thanh toán'
                });
            }

            // Lấy địa chỉ IP của người dùng
            const ipAddr = req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.ip;

            // URL callback của frontend
            const returnUrl = process.env.VNPAY_RETURN_URL || `${req.protocol}://${req.get('host')}/payment/vnpay-return`;

            // Tạo đối tượng đơn hàng
            const orderData = {
                id: orderId || `ORDER_${Date.now()}`,
                amount: amount,
                items: items || []
            };

            // Gọi service tạo thanh toán VNPay
            const response = await paymentService.createVnPayPayment(orderData, ipAddr, returnUrl);

            return res.status(200).json({
                success: true,
                data: response
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Đã xảy ra lỗi khi tạo thanh toán VNPay'
            });
        }
    }

    // Phương thức xử lý callback từ VNPay
    async vnpayReturn(req, res) {
        try {
            // Nhận các tham số trả về từ VNPay
            const vnpParams = req.query;

            // Xác thực dữ liệu thanh toán
            const verifyResult = await paymentService.verifyVnPayPayment(vnpParams);

            // Chuyển hướng về trang frontend với kết quả thanh toán
            return res.json({
                success: true,
                message: 'Thanh toán thành công',
                data: verifyResult
            });
        } catch (error) {
            return res.json({
                success: false,
                message: error.message || 'Lỗi xác thực thanh toán',
                error: error.message
            });
        }
    }

    // Phương thức xử lý IPN (Instant Payment Notification) từ VNPay
    async vnpayIpn(req, res) {
        try {
            // Nhận các tham số trả về từ VNPay
            const vnpParams = req.query;

            // Xác thực dữ liệu thanh toán
            const verifyResult = await paymentService.verifyVnPayPayment(vnpParams);

            // Cập nhật trạng thái đơn hàng trong database
            // Implement logic cập nhật đơn hàng sau

            // Phản hồi cho VNPay theo định dạng yêu cầu
            return res.status(200).json({
                RspCode: '00',
                Message: 'Confirm Success'
            });
        } catch (error) {
            return res.status(200).json({
                RspCode: '99',
                Message: 'Confirm Fail'
            });
        }
    }
}

module.exports = new PaymentController();
