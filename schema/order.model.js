const mongoose = require("mongoose");
const { ORDER_STATUS, PAYMENT_STATUS } = require("../constants/enum");
const {
  paymentMethods,
  transactionStatus,
} = require("../constants/transaction");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(paymentMethods),
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
    paymentExpiredAt: {
      type: Date,
      default: function () {
        return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
      },
    },
    shippingAddress: {
      address: { type: String, required: true },
      name: { type: String }, // Thêm nếu muốn
      phone: { type: String }, // Thêm nếu muốn
    },
    paymentIntent: {
      transactionId: { type: String },
      provider: { type: String, enum: Object.values(paymentMethods) },
      status: { type: String, enum: Object.values(transactionStatus) },
      amount: { type: Number },
      // Không required, vì có thể tạo sau khi giao dịch thanh toán thành công
    },
    vietqrUrl: { type: String }, // Lưu url QR VietQR/Sepay
    orderId: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
