const Cart = require("../schema/cart.model");
const Product = require("../schema/product.model");

class CartService {
    async addToCart(userId, productId, quantity) {
        try {
            let cart = await Cart.findOne({ userId });
            if (!cart) {
                cart = await Cart.create({ userId, items: [], totalPrice: 0 });
                cart.items.push({ productId, quantity });
                await cart.save();
                return await cart.populate({
                    path: 'items.productId',
                    select: 'name price photos stock description gardener',
                    populate: { path: 'gardener', select: 'name' }
                });
            } else {
                const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
                if (itemIndex > -1) {
                    cart.items[itemIndex].quantity += quantity;
                } else {
                    cart.items.push({ productId, quantity });
                }
            }
            await this.updateTotalPrice(cart);
            await cart.save();
            return await cart.populate({
                path: 'items.productId',
                select: 'name price photos stock description gardener',
                populate: { path: 'gardener', select: 'name' }
            });
        } catch (error) {
            throw new Error("Failed to add product to cart: " + error.message);
        }
    }

    async removeCartItem(userId, productId) {
        try {
            const cart = await Cart.findOne({ userId });
            if (!cart) {
                throw new Error('Giỏ hàng không tồn tại');
            }
            cart.items = cart.items.filter(item => item.productId.toString() !== productId);
            await this.updateTotalPrice(cart);
            await cart.save();
            return await cart.populate('items.productId', 'name price photos stock description gardener');
        } catch (error) {
            throw new Error(`Lỗi khi xóa sản phẩm khỏi giỏ hàng: ${error.message}`);
        }
    }

    async removeMultipleCartItems(userId, productIds) {
        try {
            const cart = await Cart.findOne({ userId });
            if (!cart) {
                return null;
            }
            const initialItemsCount = cart.items.length;
            cart.items = cart.items.filter(item => !productIds.includes(item.productId.toString()));
            const removedCount = initialItemsCount - cart.items.length;
            await this.updateTotalPrice(cart);
            await cart.save();
            return await cart.populate('items.productId', 'name price photos stock description gardener');
        } catch (error) {
            console.error(`Lỗi khi xóa nhiều sản phẩm khỏi giỏ hàng: ${error.message}`);
            throw new Error(`Lỗi khi xóa sản phẩm khỏi giỏ hàng: ${error.message}`);
        }
    }

    async getByUserId(userId) {
        try {
            const cart = await Cart.findOne({ userId });
            if (!cart) {
                throw new Error('Giỏ hàng không tồn tại');
            }
            const populatedCart = await cart.populate({
                path: 'items.productId',
                select: 'name price photos stock description gardener',
                populate: { path: 'gardener', select: 'name' }
            });
            return populatedCart;
        } catch (error) {
            throw new Error(`Lỗi khi lấy giỏ hàng: ${error.message}`);
        }
    }

    async clearCart(userId) {
        try {
            const cart = await Cart.findOne({ userId });
            if (!cart) {
                throw new Error('Giỏ hàng không tồn tại');
            }
            cart.items = [];
            cart.totalPrice = 0;
            await cart.save();
            return { message: 'Giỏ hàng đã được xóa sạch' };
        } catch (error) {
            throw new Error(`Lỗi khi xóa giỏ hàng: ${error.message}`);
        }
    }

    async updateTotalPrice(cart) {
        try {
            let totalPrice = 0;
            for (const item of cart.items) {
                const product = await Product.findById(item.productId);
                if (product) {
                    totalPrice += product.price * item.quantity;
                }
            }
            cart.totalPrice = totalPrice;
        } catch (error) {
            throw new Error(`Lỗi khi cập nhật tổng giá: ${error.message}`);
        }
    }
}

module.exports = new CartService();