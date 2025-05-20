const axios = require('axios');
const crypto = require('crypto');
const moment = require('moment');
const querystring = require('querystring');
const momoConfig = require('../configs/momo.config');
const vnpayConfig = require('../configs/vnpay.config');

class PaymentService {
    async createMomoPayment(amount, orderId) {
        try {
            // Sử dụng cấu hình MoMo từ file config
            const partnerCode = momoConfig.partnerCode;
            const accessKey = momoConfig.accessKey;
            const secretKey = momoConfig.secretKey;
            const returnUrl = momoConfig.redirectUrl;
            const notifyUrl = momoConfig.ipnUrl;
            const endpoint = process.env.MOMO_API_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create';

            console.log('MoMo config:', { partnerCode, accessKey, returnUrl, notifyUrl });

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
            const endpoint = process.env.MOMO_QUERY_API || 'https://test-payment.momo.vn/v2/gateway/api/query';

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
            // Sử dụng cấu hình VNPay từ file config
            const vnpTmnCode = vnpayConfig.tmnCode;
            const vnpHashSecret = vnpayConfig.hashSecret;
            const vnpUrl = vnpayConfig.vnpayHost;

            console.log('VNPay payment config:', { vnpTmnCode, vnpHashSecretAvailable: !!vnpHashSecret, vnpUrl });

            if (!vnpHashSecret) {
                console.error('VNPay Hash Secret is undefined');
                throw new Error('Thiếu VNPay Hash Secret trong cấu hình');
            }

            // Tạo ngày thanh toán theo định dạng yyyyMMddHHmmss
            const createDate = moment().format('YYYYMMDDHHmmss');

            // Tạo mã giao dịch nếu không được cung cấp
            const txnRef = orderData.id || `ORDER_${Date.now()}`;

            // Tham số thanh toán
            const vnpParams = {
                vnp_Version: '2.1.0',
                vnp_Command: 'pay',
                vnp_TmnCode: vnpTmnCode,
                vnp_Locale: vnpayConfig.VnpLocale.VN,
                vnp_CurrCode: 'VND',
                vnp_TxnRef: txnRef,
                vnp_OrderInfo: `Thanh toan don hang: ${txnRef}`,
                vnp_OrderType: vnpayConfig.ProductCode.Billpayment,
                vnp_Amount: orderData.amount * 100, // VNPay yêu cầu số tiền * 100
                vnp_ReturnUrl: returnUrl,
                vnp_IpAddr: ipAddr,
                vnp_CreateDate: createDate
            };

            console.log('VNPay request params:', vnpParams);

            // Sắp xếp các tham số theo thứ tự a-z
            const sortedParams = this.sortObject(vnpParams);

            // Tạo query string
            const signData = querystring.stringify(sortedParams, { encode: false });

            // Tạo chữ ký HMAC-SHA512
            const hmac = crypto.createHmac('sha512', vnpHashSecret);
            const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

            console.log('VNPay signature generated:', signed);

            // Thêm chữ ký vào tham số
            sortedParams.vnp_SecureHash = signed;

            // Tạo URL thanh toán
            const vnpUrlWithParams = `${vnpUrl}?${querystring.stringify(sortedParams, { encode: false })}`;

            console.log('VNPay redirect URL created');

            return {
                redirectUrl: vnpUrlWithParams
            };
        } catch (error) {
            console.error('Error creating VNPay payment:', error);
            throw new Error('Không thể tạo thanh toán VNPay: ' + error.message);
        }
    }

    async verifyVnPayPayment(vnpParams) {
        try {
            // Sử dụng cấu hình từ file config
            const vnpHashSecret = vnpayConfig.hashSecret;

            if (!vnpHashSecret) {
                console.error('VNPay Hash Secret is undefined during verification');
                throw new Error('Thiếu VNPay Hash Secret trong cấu hình');
            }

            const secureHash = vnpParams.vnp_SecureHash;

            // Xóa chữ ký khỏi params để tạo chữ ký mới
            delete vnpParams.vnp_SecureHash;
            delete vnpParams.vnp_SecureHashType;

            // Sắp xếp các tham số theo thứ tự a-z
            const sortedParams = this.sortObject(vnpParams);

            // Tạo query string
            const signData = querystring.stringify(sortedParams, { encode: false });

            // Tạo chữ ký HMAC-SHA512
            const hmac = crypto.createHmac('sha512', vnpHashSecret);
            const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

            console.log('VNPay verification - Generated signature:', signed);
            console.log('VNPay verification - Received signature:', secureHash);

            // So sánh chữ ký
            if (secureHash !== signed) {
                throw new Error('Chữ ký không hợp lệ');
            }

            // Kiểm tra kết quả giao dịch
            const responseCode = vnpParams.vnp_ResponseCode;
            if (responseCode !== '00') {
                throw new Error(`Giao dịch không thành công. Mã lỗi: ${responseCode}`);
            }

            return {
                success: true,
                orderId: vnpParams.vnp_TxnRef,
                amount: parseInt(vnpParams.vnp_Amount) / 100, // Chuyển về đơn vị gốc
                bankCode: vnpParams.vnp_BankCode,
                bankTranNo: vnpParams.vnp_BankTranNo,
                cardType: vnpParams.vnp_CardType,
                payDate: vnpParams.vnp_PayDate,
                transactionNo: vnpParams.vnp_TransactionNo
            };
        } catch (error) {
            console.error('Error verifying VNPay payment:', error);
            throw new Error('Xác thực thanh toán VNPay thất bại: ' + error.message);
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
