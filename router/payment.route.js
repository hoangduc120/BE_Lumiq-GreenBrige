const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

// Route tạo thanh toán MoMo
router.post('/momo', paymentController.createMomoPayment);

// Route callback từ MoMo
router.post('/momo/callback', paymentController.momoCallback);

// Route xác thực thanh toán từ MoMo
router.post('/momo/verify', paymentController.verifyMomoPayment);

module.exports = router; 