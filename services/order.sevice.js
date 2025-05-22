const Order = require("../schema/order.model");

class OrderSevice {
    async createOrder(req, res) {
        try {
            const { shippingAddress, paymentMethod, transactionId } = req.body;
            const userId = req.user.id;

            // Lấy dữ liệu từ giỏ hàng
            const { items, totalPrice } = await cartService.getCartForOrder(userId);

            // Tạo đơn hàng
            const order = await orderService.createOrder(
                userId,
                shippingAddress,
                paymentMethod,
                items,
                totalPrice
            );

            // Cập nhật paymentIntent nếu có
            if (transactionId) {
                order.paymentIntent = { transactionId };
                await order.save();
            }

            // Xóa giỏ hàng sau khi tạo đơn hàng (tùy chọn)
            await cartService.clearCart(userId);

            return res.status(201).json({
                success: true,
                message: 'Đơn hàng đã được tạo từ giỏ hàng',
                data: order // Chuẩn hóa key 'data'
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    async getUserOrders(userId) {
        try {
            const orders = await Order.find({ userId })
                .populate('items.productId', 'name price') // Lấy thông tin sản phẩm
                .sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo mới nhất
            return orders;
        } catch (error) {
            throw new Error(`Lỗi khi lấy danh sách đơn hàng: ${error.message}`);
        }
    }

    // Lấy chi tiết đơn hàng theo ID
    async getOrderById(userId, orderId) {
        try {
            const order = await Order.findOne({ _id: orderId, userId })
                .populate('items.productId', 'name price');
            if (!order) {
                throw new Error('Không tìm thấy đơn hàng');
            }
            return order;
        } catch (error) {
            throw new Error(`Lỗi khi lấy chi tiết đơn hàng: ${error.message}`);
        }
    }
    async updateOrderStatus(orderId, status, paymentStatus) {
        try {
            const order = await Order.findById(orderId);
            if (!order) {
                throw new Error('Không tìm thấy đơn hàng');
            }

            if (status) order.status = status;
            if (paymentStatus) order.paymentStatus = paymentStatus;

            await order.save();
            return order;
        } catch (error) {
            throw new Error(`Lỗi khi cập nhật trạng thái đơn hàng: ${error.message}`);
        }
    }
    async getCartForOrder(userId) {
        try {
            const cart = await Cart.findOne({ userId }).populate('items.productId', 'name price');
            if (!cart || !cart.items.length) {
                throw new Error('Giỏ hàng trống hoặc không tồn tại');
            }
            return {
                items: cart.items.map(item => ({
                    productId: item.productId._id,
                    quantity: item.quantity,
                    price: item.productId.price
                })),
                totalPrice: cart.totalPrice
            };
        } catch (error) {
            throw new Error(`Lỗi khi lấy giỏ hàng cho đơn hàng: ${error.message}`);
        }
    }
}

module.exports = new OrderSevice();