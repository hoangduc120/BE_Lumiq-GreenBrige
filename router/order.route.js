const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Tạo đơn hàng mới
router.post('/', authMiddleware, orderController.createOrder);

// Lấy tất cả đơn hàng của người dùng
router.get('/my-orders', authMiddleware, orderController.getUserOrders);

// Lấy chi tiết đơn hàng theo id
router.get('/:orderId', authMiddleware, orderController.getOrderById);

// Cập nhật trạng thái đơn hàng (chỉ admin hoặc sau thanh toán)
router.patch('/:orderId/status', authMiddleware, orderController.updateOrderStatus);

module.exports = router; 