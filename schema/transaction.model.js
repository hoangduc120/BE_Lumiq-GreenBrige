const mongoose = require('mongoose'); // Erase if already required
const { paymentMethods, transactionStatus } = require('../constants/transaction');

// Declare the Schema of the Mongo model
var transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    paymentMethod: {
        type: String,
        enum: Object.values(paymentMethods),
        required: true,
    },
    paymentMessage: {
        type: String,
        default: '',
    },
    paymentUrl: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        enum: Object.values(transactionStatus),
        default: transactionStatus.PENDING,
        required: true,
    }
}, { timestamps: true });

//Export the model
module.exports = mongoose.model('Transaction', transactionSchema);