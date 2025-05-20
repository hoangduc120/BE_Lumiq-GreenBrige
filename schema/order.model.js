const mongoose = require('mongoose'); // Erase if already required
const { ORDER_STATUS, PAYMENT_STATUS } = require('../constants/enum');
const { paymentMethods, transactionStatus } = require('../constants/transaction');
// Declare the Schema of the Mongo model
var orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            price: {
                type: Number,
                required: true,
                min: 0
            }
        }
    ],
    status: {
        type: String,
        enum: Object.values(ORDER_STATUS),
        default: ORDER_STATUS.PENDING,
        required: true,
    },
    paymentMethod: {
        type: String,
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: Object.values(PAYMENT_STATUS),
        default: PAYMENT_STATUS.PENDING,
        required: true,
    },
    shippingAddress: {
        type: {
            address: {
                type: String,
                required: true,
            },
            city: {
                type: String,
                required: true,
            },
            postalCode: {
                type: String,
                required: true,
            },
        }
    },
    paymentIntent: {
        type: {
            transactionId: String,
            provider: {
                type: String,
                enum: Object.values(paymentMethods),
            },
            status: {
                type: String,
                enum: Object.values(transactionStatus),
            },
            amount: {
                type: Number,
                required: true,
            },
        }
    }
}, { timestamps: true });

//Export the model
module.exports = mongoose.model('Order', orderSchema);