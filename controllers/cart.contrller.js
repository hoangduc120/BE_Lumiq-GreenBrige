const cartService = require("../services/cart.service");
const { OK, BAD_REQUEST } = require("../configs/response.config");

class CartController {
    async addToCart(req, res) {
        try {
            const userId = req.user.id;
            const { productId, quantity } = req.body;
            const cart = await cartService.addToCart(userId, productId, quantity);
            return res.status(201).json({
                success: true,
                message: "Sản phẩm đã được thêm vào giỏ hàng",
                data: cart
            });
        } catch (error) {
            return BAD_REQUEST(res, error.message);
        }
    }
    async deleteItemCart(req, res) {
        try {
            const userId = req.user.id;
            const { productId } = req.body;
            const cart = await cartService.removeCartItem(userId, productId);
            return OK(res, "Product removed from cart successfully", { cart });
        } catch (error) {
            return BAD_REQUEST(res, error.message);
        }
    }
    async deleteMultipleItems(req, res) {
        try {
            const userId = req.user.id;
            const { productIds } = req.body;

            if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
                return BAD_REQUEST(res, "productIds phải là array và không được trống");
            }

            const cart = await cartService.removeMultipleCartItems(userId, productIds);
            return OK(res, `Đã xóa ${productIds.length} sản phẩm khỏi giỏ hàng`, { cart });
        } catch (error) {
            return BAD_REQUEST(res, error.message);
        }
    }
    async getByUserId(req, res) {
        try {
            const userId = req.user.id;
            const cart = await cartService.getByUserId(userId);
            return OK(res, "Cart retrieved successfully", { cart });
        } catch (error) {
            return BAD_REQUEST(res, error.message);
        }
    }
    async clearCart(req, res) {
        try {
            const userId = req.user.id;
            const result = await cartService.clearCart(userId);
            return OK(res, "Cart cleared successfully", result);
        } catch (error) {
            return BAD_REQUEST(res, error.message);
        }
    }
}

module.exports = new CartController();