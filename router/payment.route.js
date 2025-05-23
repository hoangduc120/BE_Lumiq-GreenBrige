const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

// Route tạo thanh toán MoMo
router.post('/momo', paymentController.createMomoPayment);

// Route callback từ MoMo
router.post('/momo/callback', paymentController.momoCallback);

// Route xác thực thanh toán từ MoMo
router.post('/momo/verify', paymentController.verifyMomoPayment);

// Route tạo thanh toán VNPay
router.post('/vnpay', paymentController.createVnPayPayment);

// Route callback từ VNPay (sử dụng GET vì VNPay redirect với query params)
router.get('/vnpay-return', paymentController.vnpayReturn);

// Route nhận thông báo thanh toán tức thì từ VNPay (IPN)
router.get('/vnpay-ipn', paymentController.vnpayIpn);

// Route lấy thông tin payment
router.get('/:paymentId', paymentController.getPayment);

// Route lấy danh sách payment của user
router.get('/user/:userId', paymentController.getUserPayments);

module.exports = router; 