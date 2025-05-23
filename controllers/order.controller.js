const orderService = require('../services/order.sevice');

class OrderController {
    // Tạo đơn hàng
    async createOrder(req, res) {
        try {
            const { shippingAddress, paymentMethod, items, totalAmount, transactionId } = req.body;
            const userId = req.user.id; // Giả sử middleware xác thực đã thêm user vào req

            // Kiểm tra dữ liệu đầu vào cơ bản
            if (!shippingAddress || !paymentMethod || !items || !totalAmount) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu thông tin cần thiết'
                });
            }

            // Chuẩn bị dữ liệu shippingAddress theo schema
            const formattedShippingAddress = {
                address: typeof shippingAddress === 'string' ? shippingAddress : shippingAddress.address
            };

            // Chuẩn bị items với price từ productId
            const formattedItems = items.map(item => ({
                productId: item.productId._id,
                quantity: item.quantity,
                price: item.productId.price
            }));

            // Tạo đơn hàng
            const order = await orderService.createOrder(
                userId,
                formattedShippingAddress,
                paymentMethod,
                formattedItems,
                totalAmount
            );

            // Cập nhật paymentIntent nếu có transactionId
            if (transactionId) {
                order.paymentIntent = {
                    transactionId,
                    amount: totalAmount
                };
                await order.save();
            }
            return res.status(201).json({
                success: true,
                message: 'Đơn hàng đã được tạo',
                order
            });
        } catch (error) {
            return res.status(400).json({
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
            return res.status(200).json({
                success: true,
                orders
            });
        } catch (error) {
            return res.status(400).json({
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
            return res.status(200).json({
                success: true,
                order
            });
        } catch (error) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    async updateOrderStatus(req, res) {
        try {
            const { orderId } = req.params;
            const { status, paymentStatus } = req.body;

            const order = await orderService.updateOrderStatus(orderId, status, paymentStatus);
            return res.status(200).json({
                success: true,
                message: 'Đã cập nhật trạng thái đơn hàng',
                order
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Thêm method đơn giản để xử lý expired orders
    async processExpiredOrders(req, res) {
        try {
            const processedCount = await orderService.processExpiredOrders();
            return res.status(200).json({
                success: true,
                message: `Đã xử lý ${processedCount} orders hết hạn`,
                processedCount
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new OrderController();