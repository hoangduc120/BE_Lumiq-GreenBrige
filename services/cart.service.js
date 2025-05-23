const Cart = require("../schema/cart.model");
const Product = require("../schema/product.model");
class CartService {
    async addToCart(userId, productId, quantity) {
        try {
            let cart = await Cart.findOne({ userId });
            if (!cart) {
                cart = await Cart.create({ userId, items: [], totalPrice: 0 });
                cart.items.push({ productId, quantity });
                let newCart = await cart.save();
                return newCart;
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
            return cart;
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
            return cart.populate('items.productId', 'name price');
        } catch (error) {
            throw new Error(`Lỗi khi xóa sản phẩm khỏi giỏ hàng: ${error.message}`);
        }
    }

    async getByUserId(userId) {
        try {
            const cart = await Cart.findOne({ userId }).populate('items.productId', 'name price');
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