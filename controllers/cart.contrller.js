const cartService = require("../services/cart.service");
const { OK, BAD_REQUEST } = require("../configs/response.config");

class CartController {
    async createCart(req, res) {
        try {
            const userId = req.user.id;
            console.log('Creating cart for user:', userId);
            const cart = await cartService.createCart(userId);
            return OK(res, "Cart created successfully", { cart });
        } catch (error) {
            console.error('Error in createCart:', error);
            return BAD_REQUEST(res, error.message);
        }
    }
    async addToCart(req, res) {
        try {
            const userId = req.user.id;
            const { productId, quantity = 1 } = req.body;
            console.log('Adding product to cart:', { userId, productId, quantity });
            const cart = await cartService.addToCart(userId, productId, quantity);
            return OK(res, "Product added to cart successfully", { cart });
        } catch (error) {
            console.error('Error in addToCart:', error);
            return BAD_REQUEST(res, error.message);
        }
    }
    async deleteItemCart(req, res) {
        try {
            const userId = req.user.id;
            const { productId } = req.body;
            console.log('Removing product from cart:', { userId, productId });
            const cart = await cartService.removeCartItem(userId, productId);
            return OK(res, "Product removed from cart successfully", { cart });
        } catch (error) {
            console.error('Error in deleteItemCart:', error);
            return BAD_REQUEST(res, error.message);
        }
    }
    async getByUserId(req, res) {
        try {
            const userId = req.user.id;
            console.log('Getting cart for user:', userId);
            const cart = await cartService.getByUserId(userId);
            return OK(res, "Cart retrieved successfully", { cart });
        } catch (error) {
            console.error('Error in getByUserId:', error);
            return BAD_REQUEST(res, error.message);
        }
    }
    async clearCart(req, res) {
        try {
            const userId = req.user.id;
            console.log('Clearing cart for user:', userId);
            const result = await cartService.clearCart(userId);
            return OK(res, "Cart cleared successfully", result);
        } catch (error) {
            console.error('Error in clearCart:', error);
            return BAD_REQUEST(res, error.message);
        }
    }
}

module.exports = new CartController();