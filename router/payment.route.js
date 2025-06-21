const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const Order = require("../schema/order.model");
const axios = require("axios");
const PayoutRequest = require('../schema/payoutRequest');
const { authMiddleware, restrictTo } = require("../middlewares/authMiddleware");

// Route tạo thanh toán MoMo
router.post("/momo", paymentController.createMomoPayment);

// Route callback từ MoMo
router.post("/momo/callback", paymentController.momoCallback);

// Route xác thực thanh toán từ MoMo
router.post("/momo/verify", paymentController.verifyMomoPayment);

// Route tạo thanh toán VNPay
router.post("/vnpay", paymentController.createVnPayPayment);

// Route callback từ VNPay (sử dụng GET vì VNPay redirect với query params)
router.get("/vnpay-return", paymentController.vnpayReturn);

// Route nhận thông báo thanh toán tức thì từ VNPay (IPN)
router.get("/vnpay-ipn", paymentController.vnpayIpn);

// Route lấy thông tin payment
router.get("/:paymentId", paymentController.getPayment);

// Route lấy danh sách payment của user
router.get("/user/:userId", paymentController.getUserPayments);

router.post("/webhook", async (req, res) => {
  try {
    console.log("🔔 Webhook received:", req.body);
    const { content, transferAmount } = req.body;
    const orderIdMatch = content.match(/(ORDER\d+)/);
    const orderId = orderIdMatch ? orderIdMatch[1] : null;
    
    console.log("📝 Extracted orderId:", orderId);
    console.log("💰 Transfer amount:", transferAmount);

    if (!orderId || !transferAmount) {
      console.log("❌ Missing data - orderId:", orderId, "transferAmount:", transferAmount);
      return res.status(400).json({ error: "Thiếu dữ liệu" });
    }

    const order = await Order.findOne({ orderId });
    console.log("🔍 Found order:", order ? `ID: ${order._id}, orderId: ${order.orderId}, totalAmount: ${order.totalAmount}` : "null");
    
    if (!order) return res.status(404).json({ error: "Không tìm thấy đơn hàng" });

    if (Number(transferAmount) !== Number(order.totalAmount)) {
      console.log("❌ Amount mismatch - transferAmount:", transferAmount, "order.totalAmount:", order.totalAmount);
      return res.status(400).json({ error: "Số tiền không khớp" });
    }

    order.status = "success";
    order.paymentStatus = "paid";
    await order.save();
    console.log("✅ Order updated successfully");

    // Emit qua WebSocket
    const io = req.app.get("io");
    console.log("🔌 Emitting payment_success to room:", orderId);
    
    // Emit tới room cụ thể
    io.to(orderId).emit("payment_success", { orderId });
    
    // Emit tới tất cả clients (fallback)
    io.emit("payment_success_global", { orderId, userId: order.userId });
    
    console.log("✅ Socket events emitted for orderId:", orderId);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error.message);
    return res.status(500).json({ error: "Webhook xử lý thất bại" });
  }
});

router.get("/payout-requests", authMiddleware, restrictTo('gardener'), paymentController.getPayoutRequests);

router.patch("/payout-requests/:payoutId", authMiddleware, restrictTo('admin'), paymentController.updatePayoutRequest);





module.exports = router;
