const paymentService = require('../services/payment.service');


class PaymentCleanupMiddleware {
    constructor() {
        this.isRunning = false;
        this.intervalTime = 5 * 60 * 1000; // 5 phút
    }


    start() {
        if (this.isRunning) {
            return;
        }

        this.isRunning = true;

        this.runCleanup();

        this.interval = setInterval(() => {
            this.runCleanup();
        }, this.intervalTime);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.isRunning = false;
    }


    async runCleanup() {
        try {
            const processedCount = await paymentService.processExpiredPayments();
            if (processedCount > 0) {
            }
        } catch (error) {
            console.error('Lỗi khi xử lý payment hết hạn:', error.message);
        }
    }


    middleware() {
        return (req, res, next) => {
            if (!this.isRunning) {
                this.start();
            }
            next();
        };
    }
}

module.exports = new PaymentCleanupMiddleware(); 