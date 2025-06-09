const Cart = require("../schema/cart.model");
const Order = require("../schema/order.model");

class OrderSevice {
async createOrder(
    userId,
    shippingAddress,
    paymentMethod,
    items,
    totalAmount,
    vietqrUrl,
    orderId
) {
    try {
        const cleanOrderId = orderId.replace(/_/g, '');
        const order = await Order.create({
            userId,
            shippingAddress,
            paymentMethod,
            items,
            totalAmount,
            vietqrUrl, 
            status: "pending",
            paymentStatus: "pending",
            orderId: cleanOrderId, 
        });
        return order;
    } catch (error) {
        throw new Error(`Lỗi khi tạo đơn hàng: ${error.message}`);
    }
}
 // Lấy danh sách đơn hàng của user
async getUserOrders(userId) {
  try {
    const orders = await Order.find({ userId })
      .populate("items.productId", "name price")
      .sort({ createdAt: -1 });
    return orders;
  } catch (error) {
    throw new Error(`Lỗi khi lấy danh sách đơn hàng: ${error.message}`);
  }
}

// Lấy chi tiết đơn hàng bằng orderId (string) và userId
async getOrderByOrderId(userId, orderId) {
  try {
    const order = await Order.findOne({ orderId, userId })
      .populate("items.productId", "name price");
    if (!order) {
      throw new Error("Không tìm thấy đơn hàng");
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
        throw new Error("Không tìm thấy đơn hàng");
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
      const cart = await Cart.findOne({ userId }).populate(
        "items.productId",
        "name price"
      );
      if (!cart || !cart.items.length) {
        throw new Error("Giỏ hàng trống hoặc không tồn tại");
      }
      return {
        items: cart.items.map((item) => ({
          productId: item.productId._id,
          quantity: item.quantity,
          price: item.productId.price,
        })),
        totalPrice: cart.totalPrice,
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy giỏ hàng cho đơn hàng: ${error.message}`);
    }
  }
  async processExpiredOrders() {
    try {
      const expiredOrders = await Order.find({
        paymentStatus: "pending",
        paymentExpiredAt: { $lt: new Date() },
      });
      const updatePromises = expiredOrders.map((order) => {
        order.paymentStatus = "failed";
        order.status = "cancelled";
        return order.save();
      });
      await Promise.all(updatePromises);
      return {
        success: true,
        message: `Đã xử lý ${expiredOrders.length} đơn hàng hết hạn`,
        processedCount: expiredOrders.length,
      };
    } catch (error) {
      throw new Error(`Lỗi khi xử lý đơn hàng hết hạn: ${error.message}`);
    }
  }
}

module.exports = new OrderSevice();
