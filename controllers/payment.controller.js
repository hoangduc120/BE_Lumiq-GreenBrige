const paymentService = require('../services/payment.service');
const paymentDbService = require('../services/paymentService'); // Service cho Payment model
const cartService = require('../services/cart.service'); // Thêm cart service
const Order = require('../schema/order.model');
const { PaymentMethod } = require('../schema/payment.model');
const mongoose = require('mongoose');


async function removeOrderItemsFromCart(userId, orderId) {
    try {
        // Tìm order để lấy danh sách productIds
        const order = await findOrder(orderId);
        if (!order) {
            return;
        }
        // Lấy danh sách productIds từ order
        const productIds = order.items.map(item => item.productId.toString());
        if (productIds.length === 0) {
            return;
        }
        // Xóa các sản phẩm khỏi cart
        const cartResult = await cartService.removeMultipleCartItems(userId, productIds);

        return cartResult;
    } catch (error) {
        console.error('Lỗi khi xóa sản phẩm khỏi cart:', error.message);
    }
}


async function findOrder(orderId) {
    try {
        if (mongoose.Types.ObjectId.isValid(orderId) && orderId.length === 24) {
            return await Order.findById(orderId);
        } else {
            return null;
        }
    } catch (error) {
        console.error('Lỗi khi tìm order:', error.message);
        return null;
    }
}

class PaymentController {
    async createMomoPayment(req, res) {
        try {
            const { amount, orderId, userId, items } = req.body;

            if (!amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng cung cấp số tiền thanh toán'
                });
            }

            let order = await findOrder(orderId);

            if (!order && items && items.length > 0) {

                // Tạo order mới từ items
                const orderData = {
                    userId: userId,
                    items: items.map(item => ({
                        productId: item.id,
                        quantity: item.quantity || 1,
                        price: item.price
                    })),
                    totalAmount: amount,
                    paymentMethod: 'momo',
                    status: 'pending',
                    paymentStatus: 'pending',
                    shippingAddress: {
                        address: 'Địa chỉ mặc định' // Có thể lấy từ request nếu có
                    }
                };

                order = await Order.create(orderData);
            }

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy đơn hàng và không thể tạo order mới'
                });
            }

            // Tạo record payment trong database
            const paymentData = {
                orderId: order._id, // Sử dụng ObjectId thật của order
                userId: userId || order.userId,
                amount: amount,
                paymentMethod: PaymentMethod.MOMO,
                returnUrl: process.env.MOMO_RETURN_URL
            };

            const payment = await paymentDbService.createPayment(paymentData);

            // Tạo thanh toán MoMo với custom orderId
            const response = await paymentService.createMomoPayment(amount, orderId);

            // Cập nhật payment với URL và transaction ID
            if (response.payUrl && response.orderId) {
                await paymentDbService.updatePaymentUrl(
                    payment._id,
                    response.payUrl,
                    response.orderId
                );
            }

            return res.status(200).json({
                success: true,
                data: {
                    payUrl: response.payUrl,
                    orderId: response.orderId,
                    paymentId: payment._id,
                    realOrderId: order._id // Trả về ObjectId thật để frontend có thể dùng
                }
            });
        } catch (error) {
            console.error('Lỗi tạo thanh toán MoMo:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Đã xảy ra lỗi khi tạo thanh toán MoMo'
            });
        }
    }

    // Phương thức xử lý callback từ MoMo
    async momoCallback(req, res) {
        try {
            const { resultCode, orderId, transactionId, requestId, amount, extraData } = req.body;
            const payment = await paymentDbService.getPaymentByTransactionId(requestId);
            if (payment) {
                if (resultCode === 0) {
                    await paymentDbService.markPaymentSuccess(payment._id, req.body);
                    const orderUpdate = await Order.findByIdAndUpdate(payment.orderId, {
                        paymentStatus: 'success',
                        status: 'confirmed'
                    }, { new: true });

                    await removeOrderItemsFromCart(payment.userId.toString(), payment.orderId.toString());
                } else {
                    await paymentDbService.markPaymentFailed(
                        payment._id,
                        `Thanh toán thất bại. Mã lỗi: ${resultCode}`,
                        resultCode
                    );
                }
            } else {
            }
            return res.status(200).json({
                message: 'Callback received successfully'
            });
        } catch (error) {
            return res.status(500).json({
                error: 'Internal server error'
            });
        }
    }

    // Phương thức verify thanh toán MoMo từ frontend
    async verifyMomoPayment(req, res) {
        try {
            const { orderId, requestId, resultCode } = req.body;
            const payment = await paymentDbService.getPaymentByTransactionId(requestId);
            if (payment) {
                if (resultCode === 0) {
                    await paymentDbService.markPaymentSuccess(payment._id, req.body);
                    const orderUpdate = await Order.findByIdAndUpdate(payment.orderId, {
                        paymentStatus: 'success',
                        status: 'confirmed'
                    }, { new: true });
                    await removeOrderItemsFromCart(payment.userId.toString(), payment.orderId.toString());
                    return OK(res, 'Thanh toán thành công', {
                        paymentId: payment._id,
                        orderId: payment.orderId,
                        status: 'success'
                    });
                } else {
                    // Thanh toán thất bại
                    await paymentDbService.markPaymentFailed(
                        payment._id,
                        `Thanh toán thất bại. Mã lỗi: ${resultCode}`,
                        resultCode
                    );

                    return BAD_REQUEST(res, 'Thanh toán thất bại');
                }
            } else {
                return BAD_REQUEST(res, 'Không tìm thấy thông tin thanh toán');
            }
        } catch (error) {
            return BAD_REQUEST(res, error.message);
        }
    }

    // Phương thức tạo thanh toán VNPay
    async createVnPayPayment(req, res) {
        try {
            const { amount, orderId, userId, items } = req.body;

            if (!amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng cung cấp số tiền thanh toán'
                });
            }

            let order = await findOrder(orderId);

            // Nếu không tìm thấy order và có items, tạo order mới
            if (!order && items && items.length > 0) {

                // Tạo order mới từ items
                const orderData = {
                    userId: userId,
                    items: items.map(item => ({
                        productId: item.id,
                        quantity: item.quantity || 1,
                        price: item.price
                    })),
                    totalAmount: amount,
                    paymentMethod: 'vnpay',
                    status: 'pending',
                    paymentStatus: 'pending',
                    shippingAddress: {
                        address: 'Địa chỉ mặc định' // Có thể lấy từ request nếu có
                    }
                };

                order = await Order.create(orderData);
            }

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy đơn hàng và không thể tạo order mới'
                });
            }

            // Tạo record payment trong database
            const paymentData = {
                orderId: order._id, // Sử dụng ObjectId thật của order
                userId: userId || order.userId,
                amount: amount,
                paymentMethod: PaymentMethod.VNPAY,
                returnUrl: process.env.VNPAY_RETURN_URL
            };

            const payment = await paymentDbService.createPayment(paymentData);

            // Lấy địa chỉ IP của người dùng
            const ipAddr = req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.ip;

            // URL callback của frontend
            const returnUrl = process.env.VNPAY_RETURN_URL || `${req.protocol}://${req.get('host')}/payment/vnpay-return`;

            // Tạo đối tượng đơn hàng cho VNPay (sử dụng custom orderId)
            const orderData = {
                id: orderId || `ORDER_${Date.now()}`,
                amount: amount,
                items: items || []
            };

            // Gọi service tạo thanh toán VNPay
            const response = await paymentService.createVnPayPayment(orderData, ipAddr, returnUrl);

            // Cập nhật payment với URL và transaction ID
            if (response.redirectUrl && orderData.id) {
                await paymentDbService.updatePaymentUrl(
                    payment._id,
                    response.redirectUrl,
                    orderData.id
                );
            }

            return res.status(200).json({
                success: true,
                data: {
                    paymentUrl: response.redirectUrl,
                    orderId: orderData.id,
                    paymentId: payment._id,
                    realOrderId: order._id // Trả về ObjectId thật để frontend có thể dùng
                }
            });
        } catch (error) {
            console.error('Lỗi tạo thanh toán VNPay:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Đã xảy ra lỗi khi tạo thanh toán VNPay'
            });
        }
    }

    // Phương thức xử lý callback từ VNPay
    async vnpayReturn(req, res) {
        try {
            const vnpParams = req.query;
            const verifyResult = await paymentService.verifyVnPayPayment(vnpParams);
            const payment = await paymentDbService.getPaymentByTransactionId(vnpParams.vnp_TxnRef);

            if (payment) {
                if (vnpParams.vnp_ResponseCode === '00') {
                    await paymentDbService.markPaymentSuccess(payment._id, verifyResult);   

                    const orderUpdate = await Order.findByIdAndUpdate(payment.orderId, {
                        paymentStatus: 'success',
                        status: 'confirmed'
                    }, { new: true });

                    await removeOrderItemsFromCart(payment.userId.toString(), payment.orderId.toString());
                } else {
                    await paymentDbService.markPaymentFailed(
                        payment._id,
                        `Thanh toán thất bại. Mã lỗi: ${vnpParams.vnp_ResponseCode}`,
                        vnpParams.vnp_ResponseCode
                    );
                }
            } else {
            }
            return res.json({
                success: true,
                message: 'Thanh toán thành công',
                data: verifyResult
            });
        } catch (error) {
            return res.json({
                success: false,
                message: error.message || 'Lỗi xác thực thanh toán',
                error: error.message
            });
        }
    }

    // Phương thức xử lý IPN (Instant Payment Notification) từ VNPay
    async vnpayIpn(req, res) {
        try {

            const vnpParams = req.query;
            const verifyResult = await paymentService.verifyVnPayPayment(vnpParams);
            const payment = await paymentDbService.getPaymentByTransactionId(vnpParams.vnp_TxnRef);
            if (payment) {
                if (vnpParams.vnp_ResponseCode === '00') {
                    await paymentDbService.markPaymentSuccess(payment._id, verifyResult);
                    const orderUpdate = await Order.findByIdAndUpdate(payment.orderId, {
                        paymentStatus: 'success',
                        status: 'confirmed'
                    }, { new: true });
                    await removeOrderItemsFromCart(payment.userId.toString(), payment.orderId.toString());
                } else {
                    await paymentDbService.markPaymentFailed(
                        payment._id,
                        `Thanh toán thất bại. Mã lỗi: ${vnpParams.vnp_ResponseCode}`,
                        vnpParams.vnp_ResponseCode
                    );
                }
            } else {
            }
            return res.status(200).json({
                RspCode: '00',
                Message: 'Confirm Success'
            });
        } catch (error) {
            console.error('💥 VNPay IPN Error:', error);
            return res.status(200).json({
                RspCode: '99',
                Message: 'Confirm Fail'
            });
        }
    }

    // API để lấy thông tin payment
    async getPayment(req, res) {
        try {
            const { paymentId } = req.params;

            const payment = await paymentDbService.getPaymentById(paymentId);

            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy thông tin thanh toán'
                });
            }

            return res.status(200).json({
                success: true,
                data: payment
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Đã xảy ra lỗi khi lấy thông tin thanh toán'
            });
        }
    }

    // API để lấy danh sách payment của user
    async getUserPayments(req, res) {
        try {
            const { userId } = req.params;
            const { page = 1, limit = 10 } = req.query;

            const options = {
                limit: parseInt(limit),
                skip: (parseInt(page) - 1) * parseInt(limit)
            };

            const payments = await paymentDbService.getPaymentsByUserId(userId, options);

            return res.status(200).json({
                success: true,
                data: payments,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit)
                }
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Đã xảy ra lỗi khi lấy danh sách thanh toán'
            });
        }
    }

    async debugPayment(req, res) {
        try {
            const { paymentId } = req.params;
            const { action } = req.body; // 'markSuccess', 'markFailed', 'info'

            const payment = await paymentDbService.getPaymentById(paymentId);
            if (!payment) {
                return BAD_REQUEST(res, 'Payment không tồn tại');
            }

            if (action === 'markSuccess') {

                // Mark payment as success
                await paymentDbService.markPaymentSuccess(payment._id, {
                    message: 'Manually marked as success',
                    resultCode: '00'
                });

                // Update order
                const orderUpdate = await Order.findByIdAndUpdate(payment.orderId, {
                    paymentStatus: 'success',
                    status: 'confirmed'
                }, { new: true });

                await removeOrderItemsFromCart(payment.userId.toString(), payment.orderId.toString());
                return OK(res, 'Payment marked as success', {
                    paymentId: payment._id,
                    orderId: payment.orderId,
                    newStatus: 'success'
                });
            }

            if (action === 'markFailed') {
                await paymentDbService.markPaymentFailed(payment._id, 'Manually marked as failed', '99');
                return OK(res, 'Payment marked as failed');
            }

            // Default: return info
            return OK(res, 'Payment information', {
                payment: payment,
                order: await Order.findById(payment.orderId)
            });

        } catch (error) {
            console.error('💥 Debug Payment Error:', error);
            return BAD_REQUEST(res, error.message);
        }
    }

    async listPendingPayments(req, res) {
        try {
            const pendingPayments = await Payment.find({
                paymentStatus: 'pending'
            }).populate('orderId').limit(10).sort({ createdAt: -1 });


            return OK(res, 'Pending payments', {
                count: pendingPayments.length,
                payments: pendingPayments.map(p => ({
                    paymentId: p._id,
                    orderId: p.orderId._id,
                    userId: p.userId,
                    amount: p.amount,
                    paymentMethod: p.paymentMethod,
                    createdAt: p.createdAt,
                    transactionId: p.transactionId
                }))
            });
        } catch (error) {
            console.error('💥 List Pending Payments Error:', error);
            return BAD_REQUEST(res, error.message);
        }
    }
}

module.exports = new PaymentController();
