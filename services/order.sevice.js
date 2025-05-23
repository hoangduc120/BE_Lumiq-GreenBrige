const Order = require("../schema/order.model");

class OrderSevice {
    async createOrder(userId, shippingAddress, paymentMethod, items, totalAmount) {
        try {
            // Tạo đơn hàng với dữ liệu được truyền vào
            const order = await Order.create({
                userId,
                shippingAddress,
                paymentMethod,
                items,
                totalAmount,
                status: 'pending',
                paymentStatus: 'pending'
            });

            return order;
        } catch (error) {
            throw new Error(`Lỗi khi tạo đơn hàng: ${error.message}`);
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