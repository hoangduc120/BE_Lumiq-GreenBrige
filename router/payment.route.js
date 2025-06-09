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
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: "Missing orderId" });
    }

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    let found = false;
    try {
      const { data } = await axios.get(
        "https://my.sepay.vn/userapi/transactions/list",
        {
          params: {
            account_number: "0911146605",
            limit: 20,
          },
          headers: {
            Authorization: `Bearer ${process.env.SEPAY_API_KEY}`,
          },
        }
      );

      const transaction = data.transactions.find(
        (tran) =>
          tran.transaction_content &&
          tran.transaction_content.includes(orderId) &&
          Number(tran.amount_in) === Number(order.totalAmount)
      );

      if (!transaction) {
        return res.status(400).json({
          error: "Không tìm thấy giao dịch phù hợp trong Sepay",
        });
      }

      order.status = "success";
      order.paymentStatus = "paid";
      await order.save();

      return res.status(200).json({
        success: true,
        message: "Đơn hàng đã được xác nhận thanh toán!",
        orderId,
      });
    } catch (err) {
      console.error("❌ Error call Sepay:", err.message);
      return res.status(500).json({ error: "Lỗi khi gọi Sepay API" });
    }
  } catch (error) {
    console.error("❌ Webhook error:", error.message);
    res.status(500).json({ error: "Error processing webhook" });
  }
});

module.exports = router;
