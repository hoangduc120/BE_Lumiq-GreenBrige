const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.contrller');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Lấy giỏ hàng của người dùng hiện tại
router.get('/', authMiddleware, cartController.getByUserId);

// Thêm sản phẩm vào giỏ hàng
router.post('/add', authMiddleware, cartController.addToCart);

// Xóa sản phẩm khỏi giỏ hàng
router.delete('/item', authMiddleware, cartController.deleteItemCart);

// Xóa toàn bộ giỏ hàng
router.delete('/clear', authMiddleware, cartController.clearCart);

module.exports = router; 