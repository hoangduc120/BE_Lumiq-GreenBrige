const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const Order = require("../schema/order.model");
const axios = require("axios");

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
    const { content, transferAmount } = req.body;

    if (!content || !transferAmount) {
      return res.status(400).json({ error: "Missing transaction details" });
    }

    const orderIdMatch = content.match(/(ORDER\d+)/);
    const orderId = orderIdMatch ? orderIdMatch[1] : null;

    if (!orderId) {
      return res.status(400).json({ error: "Không tìm thấy orderId trong nội dung chuyển tiền" });
    }

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (Number(transferAmount) !== Number(order.totalAmount)) {
      return res.status(400).json({ error: "Số tiền giao dịch không khớp với đơn hàng" });
    }

    order.status = "success";
    order.paymentStatus = "paid";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Đơn hàng đã được xác nhận thanh toán!",
      orderId,
    });

  } catch (error) {
    console.error("❌ Webhook error:", error.message);
    res.status(500).json({ error: "Error processing webhook" });
  }
});



module.exports = router;
