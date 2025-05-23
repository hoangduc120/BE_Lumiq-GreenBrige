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
                // Populate và return cart
                return await cart.populate('items.productId', 'productName price image stock author description');
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
            // Populate và return cart
            return await cart.populate('items.productId', 'productName price image stock author description');
        } catch (error) {
            throw new Error("Failed to add product to cart");
        }
    }
    async removeCartItem(userId, productId) {
        try {
            // Tìm giỏ hàng của người dùng
            const cart = await Cart.findOne({ userId });
            if (!cart) {
                throw new Error('Giỏ hàng không tồn tại');
            }

            // Xóa sản phẩm khỏi danh sách items
            cart.items = cart.items.filter(item => item.productId.toString() !== productId);

            // Cập nhật tổng giá
            await this.updateTotalPrice(cart);

            // Lưu giỏ hàng
            await cart.save();
            return cart.populate('items.productId', 'productName price image stock author description');
        } catch (error) {
            throw new Error(`Lỗi khi xóa sản phẩm khỏi giỏ hàng: ${error.message}`);
        }
    }

    /**
     * Xóa nhiều sản phẩm khỏi giỏ hàng theo danh sách productIds
     * @param {string} userId - ID người dùng
     * @param {Array} productIds - Mảng các productId cần xóa
     * @returns {Object} Cart đã được cập nhật
     */
    async removeMultipleCartItems(userId, productIds) {
        try {
            // Tìm giỏ hàng của người dùng
            const cart = await Cart.findOne({ userId });
            if (!cart) {
                return null;
            }

            // Lưu số lượng items trước khi xóa để log
            const initialItemsCount = cart.items.length;

            // Xóa các sản phẩm khỏi danh sách items
            cart.items = cart.items.filter(item =>
                !productIds.includes(item.productId.toString())
            );

            // Log số lượng items đã được xóa
            const removedCount = initialItemsCount - cart.items.length;

            // Cập nhật tổng giá
            await this.updateTotalPrice(cart);

            // Lưu giỏ hàng
            await cart.save();

            return await cart.populate('items.productId', 'productName price image stock author description');
        } catch (error) {
            console.error(`Lỗi khi xóa nhiều sản phẩm khỏi giỏ hàng: ${error.message}`);
            throw new Error(`Lỗi khi xóa sản phẩm khỏi giỏ hàng: ${error.message}`);
        }
    }

    async getByUserId(userId) {
        try {
            const cart = await Cart.findOne({ userId }).populate('items.productId', 'productName price image stock author description');
            if (!cart) {
                throw new Error('Giỏ hàng không tồn tại');
            }
            return cart;
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

            // Xóa toàn bộ items và đặt lại totalPrice
            cart.items = [];
            cart.totalPrice = 0;

            // Lưu giỏ hàng
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