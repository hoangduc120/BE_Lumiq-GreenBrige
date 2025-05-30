const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    aiFreeUsage: { type: Number, default: 0 }, // Số lần free sử dụng AI
    voucherCode: {
      type: String, // Lưu code của voucher thay vì ObjectId
      default: null,
    },
    duration: { type: Number, required: true }, 
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
