const crypto = require('crypto');
const https = require('https');
const momoConfig = require('../configs/momo.config');

class PaymentService {
    async createMomoPayment(amount, orderId) {
        try {
            // Nếu không có orderId được cung cấp, tạo một mã mới
            if (!orderId) {
                orderId = momoConfig.generateOrderId();
            }

            const requestId = momoConfig.generateRequestId();

            // Tạo raw signature
            const rawSignature = `accessKey=${momoConfig.accessKey}&amount=${amount}&extraData=${momoConfig.extraData}&ipnUrl=${momoConfig.ipnUrl}&orderId=${orderId}&orderInfo=${momoConfig.orderInfo}&partnerCode=${momoConfig.partnerCode}&redirectUrl=${momoConfig.redirectUrl}&requestId=${requestId}&requestType=${momoConfig.requestType}`;

            // Tạo chữ ký
            const signature = crypto.createHmac('sha256', momoConfig.secretKey)
                .update(rawSignature)
                .digest('hex');

            // Tạo request body
            const requestBody = JSON.stringify({
                partnerCode: momoConfig.partnerCode,
                accessKey: momoConfig.accessKey,
                requestId: requestId,
                amount: amount.toString(),
                orderId: orderId,
                orderInfo: momoConfig.orderInfo,
                redirectUrl: momoConfig.redirectUrl,
                ipnUrl: momoConfig.ipnUrl,
                extraData: momoConfig.extraData,
                requestType: momoConfig.requestType,
                signature: signature,
                lang: momoConfig.lang
            });

            // Gửi request đến MoMo API
            return new Promise((resolve, reject) => {
                const options = {
                    hostname: 'test-payment.momo.vn',
                    port: 443,
                    path: '/v2/gateway/api/create',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(requestBody)
                    }
                };

                const req = https.request(options, res => {
                    let data = '';

                    res.on('data', (chunk) => {
                        data += chunk;
                    });

                    res.on('end', () => {
                        try {
                            const response = JSON.parse(data);
                            resolve(response);
                        } catch (error) {
                            reject(error);
                        }
                    });
                });

                req.on('error', (error) => {
                    reject(error);
                });

                req.write(requestBody);
                req.end();
            });
        } catch (error) {
            throw new Error(`Lỗi khi tạo thanh toán MoMo: ${error.message}`);
        }
    }

    async verifyMomoPayment(requestData) {
        try {
            // Trích xuất các thông tin từ dữ liệu request
            const { orderId, requestId, amount, resultCode, transId, signature } = requestData;

            // Tạo raw signature để xác thực
            const rawSignature = `accessKey=${momoConfig.accessKey}&amount=${amount}&extraData=${requestData.extraData || ''}&orderId=${orderId}&orderInfo=${requestData.orderInfo || momoConfig.orderInfo}&partnerCode=${momoConfig.partnerCode}&requestId=${requestId}&resultCode=${resultCode}`;

            // Tạo chữ ký để so sánh
            const checkSignature = crypto.createHmac('sha256', momoConfig.secretKey)
                .update(rawSignature)
                .digest('hex');

            // Kiểm tra chữ ký và mã kết quả
            if (checkSignature !== signature) {
                throw new Error('Chữ ký không hợp lệ');
            }

            if (resultCode !== 0) {
                throw new Error(`Thanh toán không thành công. Mã lỗi: ${resultCode}`);
            }

            // Lưu thông tin giao dịch vào database
            // Implement logic lưu DB sau

            return true;
        } catch (error) {
            throw new Error(`Lỗi khi xác thực thanh toán MoMo: ${error.message}`);
        }
    }

    async verifyMomoPaymentStatus(orderId, requestId) {
        try {
            // Tạo raw signature
            const rawSignature = `accessKey=${momoConfig.accessKey}&orderId=${orderId}&partnerCode=${momoConfig.partnerCode}&requestId=${requestId}`;

            // Tạo chữ ký
            const signature = crypto.createHmac('sha256', momoConfig.secretKey)
                .update(rawSignature)
                .digest('hex');

            // Tạo request body
            const requestBody = JSON.stringify({
                partnerCode: momoConfig.partnerCode,
                accessKey: momoConfig.accessKey,
                requestId: requestId,
                orderId: orderId,
                signature: signature,
                lang: momoConfig.lang
            });

            // Gửi request đến MoMo API để kiểm tra trạng thái
            return new Promise((resolve, reject) => {
                const options = {
                    hostname: 'test-payment.momo.vn',
                    port: 443,
                    path: '/v2/gateway/api/query',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(requestBody)
                    }
                };

                const req = https.request(options, res => {
                    let data = '';

                    res.on('data', (chunk) => {
                        data += chunk;
                    });

                    res.on('end', () => {
                        try {
                            const response = JSON.parse(data);
                            resolve(response);
                        } catch (error) {
                            reject(error);
                        }
                    });
                });

                req.on('error', (error) => {
                    reject(error);
                });

                req.write(requestBody);
                req.end();
            });
        } catch (error) {
            throw new Error(`Lỗi khi kiểm tra trạng thái thanh toán MoMo: ${error.message}`);
        }
    }
}

module.exports = new PaymentService();
