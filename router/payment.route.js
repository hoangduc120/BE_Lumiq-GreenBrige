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
    const { content, transferAmount } = req.body;
    const orderIdMatch = content.match(/(ORDER\d+)/);
    const orderId = orderIdMatch ? orderIdMatch[1] : null;

    if (!orderId || !transferAmount) {
      return res.status(400).json({ error: "Thiếu dữ liệu" });
    }

    const order = await Order.findOne({ orderId }).populate('items.productId');
    if (!order) return res.status(404).json({ error: "Không tìm thấy đơn hàng" });

    if (Number(transferAmount) !== Number(order.totalAmount)) {
      return res.status(400).json({ error: "Số tiền không khớp" });
    }

    order.status = "success";
    order.paymentStatus = "paid";
    await order.save();

    const gardenerMap = {};

    for (const item of order.items) {
      const product = item.productId;
      const gardenerId = product.gardener.toString();
      const amount = item.price * item.quantity;

      if (!gardenerMap[gardenerId]) {
        gardenerMap[gardenerId] = {
          total: 0,
        };
      }

      gardenerMap[gardenerId].total += amount;
    }

    const commissionPercent = 10;

    for (const [gardenerId, data] of Object.entries(gardenerMap)) {
      const amountToPayout = Math.round(data.total * (1 - commissionPercent / 100));

      const existing = await PayoutRequest.findOne({
        orderId,
        gardenerId,
      });

      if (!existing) {
        await PayoutRequest.create({
          orderId,
          gardenerId,
          userId: order.userId,
          totalAmount: data.total,
          amountToPayout,
          commissionPercent,
          status: 'pending',
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Đã cập nhật đơn và tạo các payout",
      orderId,
    });

  } catch (error) {
    console.error("❌ Webhook error:", error.message);
    return res.status(500).json({ error: "Webhook xử lý thất bại" });
  }
});

router.get("/payout-requests", authMiddleware, restrictTo('gardener'), paymentController.getPayoutRequests);

router.patch("/payout-requests/:payoutId", authMiddleware, restrictTo('admin'), paymentController.updatePayoutRequest);





module.exports = router;
