const mongoose = require('mongoose');

const payoutRequestSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    index: true,
  },
  gardenerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  commissionPercent: {
    type: Number,
    default: 10, // admin lấy 10%
  },
  amountToPayout: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'paid', 'rejected'],
    default: 'pending',
  },
  note: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('PayoutRequest', payoutRequestSchema);
