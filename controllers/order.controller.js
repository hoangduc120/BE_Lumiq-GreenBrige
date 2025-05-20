const orderService = require('../services/order.sevice.js');

class OrderController {
    // Tạo đơn hàng
    async createOrder(req, res) {
        try {
            const { shippingAddress, paymentMethod, items, totalAmount, transactionId } = req.body;
            const userId = req.user.id; // Giả sử middleware xác thực đã thêm user vào req

            // Lưu transactionId vào paymentIntent nếu có
            const paymentIntent = transactionId ? { transactionId } : null;

            // Xử lý tạo đơn hàng từ giỏ hàng hoặc từ danh sách sản phẩm trực tiếp
            const order = await orderService.createOrder(
                userId,
                shippingAddress,
                paymentMethod,
                items,
                totalAmount
            );

            // Cập nhật paymentIntent nếu có
            if (paymentIntent) {
                order.paymentIntent = paymentIntent;
                await order.save();
            }

            res.status(201).json({
                success: true,
                message: 'Đơn hàng đã được tạo',
                order
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Lấy danh sách đơn hàng
    async getUserOrders(req, res) {
        try {
            const userId = req.user.id;
            const orders = await orderService.getUserOrders(userId);
            res.status(200).json({
                success: true,
                orders
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Lấy chi tiết đơn hàng
    async getOrderById(req, res) {
        try {
            const userId = req.user.id;
            const { orderId } = req.params;
            const order = await orderService.getOrderById(userId, orderId);
            res.status(200).json({
                success: true,
                order
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    // Cập nhật trạng thái đơn hàng (dành cho admin hoặc tích hợp thanh toán)
    async updateOrderStatus(req, res) {
        try {
            const { orderId } = req.params;
            const { status, paymentStatus } = req.body;
            const order = await orderService.updateOrderStatus(orderId, status, paymentStatus);
            res.status(200).json({
                success: true,
                message: 'Đã cập nhật trạng thái đơn hàng',
                order
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new OrderController();