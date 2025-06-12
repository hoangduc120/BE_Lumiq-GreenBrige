const orderService = require("../services/order.sevice");
const mongoose = require("mongoose");

class OrderController {
  // Tạo đơn hàng
  async createOrder(req, res) {
    try {
      const {
        orderId, // <-- nhận từ FE
        shippingAddress,
        paymentMethod,
        items,
        totalAmount,
        transactionId,
      } = req.body;
      const userId = req.user.id;

      if (
        !shippingAddress ||
        !paymentMethod ||
        !items ||
        !totalAmount ||
        !orderId
      ) {
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin cần thiết",
        });
      }

      const formattedShippingAddress = {
        address:
          typeof shippingAddress === "string"
            ? shippingAddress
            : shippingAddress.address,
      };

      const formattedItems = items.map((item) => ({
        productId: new mongoose.Types.ObjectId(item.productId),
        quantity: item.quantity,
        price: item.price,
      }));

      // Tạo link QR với orderId FE gửi lên
      let vietqrUrl = undefined;
      if (paymentMethod === "vietqr") {
        vietqrUrl = `https://qr.sepay.vn/img?acc=0911146605&bank=MBBANK&amount=${totalAmount}&des=${orderId}&template=compact&download=true`;
      }

      // Lưu luôn orderId FE truyền lên
      const order = await orderService.createOrder(
        userId,
        formattedShippingAddress,
        paymentMethod,
        formattedItems,
        totalAmount,
        vietqrUrl,
        orderId 
      );

      if (transactionId) {
        order.paymentIntent = {
          transactionId,
          amount: totalAmount,
        };
        await order.save();
      }

      return res.status(201).json({
        success: true,
        message: "Đơn hàng đã được tạo",
        order,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
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
      orders,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// Lấy chi tiết đơn hàng theo orderId (string)
async getOrderById(req, res) {
  try {
    const userId = req.user.id;
    const { orderId } = req.params; // orderId là string FE tạo, không phải _id
    const order = await orderService.getOrderByOrderId(userId, orderId);
    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}


  async updateOrderStatus(req, res) {
    try {
      const { orderId } = req.params;
      const { status, paymentStatus } = req.body;

      const order = await orderService.updateOrderStatus(
        orderId,
        status,
        paymentStatus
      );
      return res.status(200).json({
        success: true,
        message: "Đã cập nhật trạng thái đơn hàng",
        order,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
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
        processedCount,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new OrderController();
