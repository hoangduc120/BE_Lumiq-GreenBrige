const axios = require('axios');
const crypto = require('crypto');
const moment = require('moment');
const querystring = require('querystring');
const momoConfig = require('../configs/momo.config');
const vnpayConfig = require('../configs/vnpay.config');
const { vnpay, ProductCode, VnpLocale } = vnpayConfig;

class PaymentService {
    async createMomoPayment(amount, orderId) {
        try {
            // Sử dụng cấu hình MoMo từ file config
            const partnerCode = momoConfig.partnerCode;
            const accessKey = momoConfig.accessKey;
            const secretKey = momoConfig.secretKey;
            const returnUrl = momoConfig.redirectUrl;
            const notifyUrl = momoConfig.ipnUrl;
            const endpoint = process.env.MOMO_API_ENDPOINT;

            console.log('MoMo config:', { partnerCode, accessKey, returnUrl, notifyUrl, endpoint });

            if (!secretKey) {
                console.error('MoMo Secret Key is undefined');
                throw new Error('Thiếu MoMo Secret Key trong cấu hình');
            }

            // Tạo requestId duy nhất
            const requestId = `${moment().format('YYYYMMDD')}_${orderId || momoConfig.generateOrderId()}_${Date.now()}`;
            const orderInfo = `Thanh toán đơn hàng: ${orderId || momoConfig.generateOrderId()}`;

            // Chuẩn bị dữ liệu gửi đến MoMo
            const rawData = {
                partnerCode: partnerCode,
                accessKey: accessKey,
                requestId: requestId,
                amount: amount,
                orderId: orderId || momoConfig.generateOrderId(),
                orderInfo: orderInfo,
                redirectUrl: returnUrl,
                ipnUrl: notifyUrl,
                requestType: momoConfig.requestType,
                extraData: momoConfig.extraData,
                lang: momoConfig.lang
            };

            console.log('MoMo request data:', rawData);

            // Tạo chữ ký
            const message = `accessKey=${accessKey}&amount=${amount}&extraData=${rawData.extraData}&ipnUrl=${notifyUrl}&orderId=${rawData.orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${returnUrl}&requestId=${requestId}&requestType=${momoConfig.requestType}`;
            const signature = crypto.createHmac('sha256', secretKey)
                .update(message)
                .digest('hex');

            rawData.signature = signature;
            console.log('MoMo signature generated:', signature);

            // Gửi request đến MoMo
            console.log('Sending request to MoMo endpoint:', endpoint);
            const response = await axios.post(endpoint, rawData);
            console.log('MoMo response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error creating MoMo payment:', error);
            if (error.response) {
                console.error('MoMo API response error:', {
                    status: error.response.status,
                    data: error.response.data
                });
            }
            throw new Error('Không thể tạo thanh toán MoMo: ' + (error.response?.data?.message || error.message));
        }
    }

    async verifyMomoPayment(data) {
        try {
            // Kiểm tra chữ ký
            const secretKey = process.env.MOMO_SECRET_KEY;
            const accessKey = process.env.MOMO_ACCESS_KEY;
            const partnerCode = process.env.MOMO_PARTNER_CODE;

            // Kiểm tra xem giao dịch có thành công không
            if (data.resultCode !== 0) {
                return false;
            }

            // Tạo chữ ký để xác thực
            const message = `accessKey=${accessKey}&amount=${data.amount}&extraData=${data.extraData}&orderId=${data.orderId}&orderInfo=${data.orderInfo}&orderType=${data.orderType}&partnerCode=${partnerCode}&payType=${data.payType}&requestId=${data.requestId}`;

            const signature = crypto.createHmac('sha256', secretKey)
                .update(message)
                .digest('hex');

            // So sánh chữ ký
            return signature === data.signature;
        } catch (error) {
            console.error('Error verifying MoMo payment:', error);
            return false;
        }
    }

    async verifyMomoPaymentStatus(orderId, requestId) {
        try {
            // Cấu hình MoMo từ environment variables
            const partnerCode = process.env.MOMO_PARTNER_CODE;
            const accessKey = process.env.MOMO_ACCESS_KEY;
            const secretKey = process.env.MOMO_SECRET_KEY;
            const endpoint = process.env.MOMO_QUERY_API;

            // Chuẩn bị dữ liệu gửi đến MoMo
            const rawData = {
                partnerCode: partnerCode,
                accessKey: accessKey,
                requestId: `QUERY_${Date.now()}`,
                orderId: orderId,
                lang: 'vi'
            };

            // Tạo chữ ký
            const message = `accessKey=${accessKey}&orderId=${orderId}&partnerCode=${partnerCode}&requestId=${rawData.requestId}`;
            const signature = crypto.createHmac('sha256', secretKey)
                .update(message)
                .digest('hex');

            rawData.signature = signature;

            // Gửi request đến MoMo
            const response = await axios.post(endpoint, rawData);
            return response.data;
        } catch (error) {
            console.error('Error checking MoMo payment status:', error);
            throw new Error('Không thể kiểm tra trạng thái thanh toán MoMo: ' + error.message);
        }
    }

    async createVnPayPayment(orderData, ipAddr, returnUrl) {
        try {
            // Tạo mã đơn hàng nếu chưa có
            if (!orderData.id) {
                orderData.id = `ORDER_${Date.now()}`;
            }

            console.log('VNPay payment params:', {
                amount: orderData.amount,
                orderId: orderData.id,
                ipAddr,
                returnUrl
            });

            // Tạo URL thanh toán VNPay
            const paymentUrl = vnpay.buildPaymentUrl({
                vnp_Amount: orderData.amount * 100, // VNPay yêu cầu số tiền phải * 100 (VND -> xu)
                vnp_IpAddr: ipAddr,
                vnp_TxnRef: orderData.id,
                vnp_OrderInfo: `Thanh toan don hang ${orderData.id}`,
                vnp_OrderType: ProductCode.Other,
                vnp_ReturnUrl: returnUrl,
                vnp_Locale: VnpLocale.VN
            });

            console.log('VNPay payment URL created:', paymentUrl);

            return {
                redirectUrl: paymentUrl,
                orderId: orderData.id
            };
        } catch (error) {
            console.error('Error creating VNPay payment:', error);
            throw new Error(`Không thể tạo thanh toán VNPay: ${error.message}`);
        }
    }

    async verifyVnPayPayment(vnpParams) {
        try {
            console.log('Verifying VNPay params:', vnpParams);

            // Kiểm tra tính hợp lệ của dữ liệu
            const isValid = vnpay.verifyReturnUrl(vnpParams);

            if (!isValid) {
                throw new Error('Dữ liệu không hợp lệ hoặc đã bị chỉnh sửa');
            }

            // Kiểm tra mã trạng thái
            if (vnpParams.vnp_ResponseCode !== '00') {
                throw new Error(`Thanh toán không thành công. Mã lỗi: ${vnpParams.vnp_ResponseCode}`);
            }

            // Lưu thông tin giao dịch vào database
            // Implement logic lưu DB sau

            return {
                success: true,
                orderId: vnpParams.vnp_TxnRef,
                amount: parseInt(vnpParams.vnp_Amount) / 100, // Chuyển từ xu sang VND
                bankCode: vnpParams.vnp_BankCode,
                bankTranNo: vnpParams.vnp_BankTranNo,
                cardType: vnpParams.vnp_CardType,
                payDate: vnpParams.vnp_PayDate,
                transactionNo: vnpParams.vnp_TransactionNo
            };
        } catch (error) {
            console.error('Error verifying VNPay payment:', error);
            throw new Error(`Lỗi khi xác thực thanh toán VNPay: ${error.message}`);
        }
    }

    sortObject(obj) {
        const sorted = {};
        const keys = Object.keys(obj).sort();

        for (const key of keys) {
            if (obj.hasOwnProperty(key)) {
                sorted[key] = obj[key];
            }
        }

        return sorted;
    }
}

module.exports = new PaymentService();
